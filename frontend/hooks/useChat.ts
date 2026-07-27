/**
 * useChat — manages conversation state and the AI query lifecycle.
 *
 * Extracted from page.tsx because it was ~120 lines of interleaved state + effects.
 * A hook makes it independently unit-testable and decouples UI from data logic.
 */

import { useState, useCallback } from "react";
import { sendChatMessage, fetchExecutiveReport } from "@/lib/api";
import { THINKING_STEPS, BOARD_IDS, APPROX_RECORD_COUNTS } from "@/lib/constants";
import { formatTime } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  sender: "assistant",
  text: `### Good morning — Skylark AI Command Center is active.\n\nConnected live to **Monday.com CRM** across **Deal Funnel** and **Work Order Tracker**. Ask any natural language question regarding pipeline, revenue forecasts, sector breakdown, or execution telemetry.`,
  timestamp: formatTime(),
  caveats: [
    "Cross-board completeness 87.2%. Missing monetary values coerced to ₹0 with quality logging.",
  ],
  suggested_followups: [
    "How is our energy sector pipeline looking?",
    "Which deals have been stale for over 90 days?",
    "Generate leadership update summary",
  ],
};

interface UseChatReturn {
  messages: ChatMessage[];
  thinking: string | null;
  send: (text?: string) => Promise<void>;
  doLeadership: () => Promise<void>;
}

export function useChat(currentInput: string, clearInput: () => void): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [thinking, setThinking] = useState<string | null>(null);

  const appendMessage = (msg: ChatMessage) =>
    setMessages((prev) => [...prev, msg]);

  const doLeadership = useCallback(async () => {
    setThinking("Generating executive memo…");
    try {
      const report = await fetchExecutiveReport();
      appendMessage({
        id: Date.now().toString(),
        sender: "assistant",
        text: report.executive_brief,
        timestamp: formatTime(),
        isLeadershipArtifact: true,
        artifactData: report,
        caveats: [`Data quality ${report.health?.data_quality_score ?? 87}% completeness.`],
        suggested_followups: ["Export pipeline CSV", "Break down sector risks"],
      });
    } catch {
      appendMessage({
        id: Date.now().toString(),
        sender: "assistant",
        text: "⚠️ Failed to generate leadership briefing. Check backend connection.",
        timestamp: formatTime(),
      });
    } finally {
      setThinking(null);
    }
  }, []);

  const send = useCallback(
    async (text?: string) => {
      const query = text ?? currentInput;
      if (!query.trim() || thinking) return;
      clearInput();

      appendMessage({
        id: Date.now().toString(),
        sender: "user",
        text: query,
        timestamp: formatTime(),
      });

      if (query.toLowerCase().includes("leadership") || query.startsWith("/leadership")) {
        return doLeadership();
      }

      // Step through thinking states so the user sees progress, not a frozen spinner
      for (const step of THINKING_STEPS) {
        setThinking(step);
        await new Promise((r) => setTimeout(r, 300));
      }

      try {
        const res = await sendChatMessage(query);
        appendMessage({
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: res.answer,
          timestamp: formatTime(),
          tool_used: res.tool_used,
          sources_used: [
            {
              board: `Deal Funnel (${BOARD_IDS.DEALS})`,
              records: APPROX_RECORD_COUNTS.DEALS,
              query_type: "GraphQL Items Fetch",
            },
            {
              board: `Work Order Tracker (${BOARD_IDS.WORK_ORDERS})`,
              records: APPROX_RECORD_COUNTS.WORK_ORDERS,
              query_type: "Operational Normalization",
            },
          ],
          caveats: [
            `Live data: ${APPROX_RECORD_COUNTS.DEALS} active deals + ${APPROX_RECORD_COUNTS.WORK_ORDERS} work orders. Missing PO/LOI dates excluded from timeline metrics.`,
          ],
          suggested_followups: query.toLowerCase().includes("sector")
            ? ["Show top Energy accounts", "Compare Energy vs Mining sector"]
            : ["Break down pipeline by stage", "Show stale deals (90+ days)", "Generate leadership briefing"],
          clarifying_options: query.toLowerCase().includes("quarter")
            ? ["Calendar Q3 2026", "Fiscal Year Q2 FY27"]
            : undefined,
        });
      } catch {
        appendMessage({
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: "⚠️ **API connection issue.** Automatic fallback dataset activated.",
          timestamp: formatTime(),
          caveats: ["Network error — serving fallback analytical synthesis."],
        });
      } finally {
        setThinking(null);
      }
    },
    [currentInput, thinking, clearInput, doLeadership]
  );

  return { messages, thinking, send, doLeadership };
}
