'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Cpu, Trash2, ArrowRight, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '@/lib/api';
import { ChatMessage } from '@/lib/types';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_QUESTIONS = [
  "How's our overall pipeline health and business outlook?",
  "Which sales rep is top performer by revenue?",
  "What is our work order execution status and billing situation?",
  "Which industry sector needs immediate attention?",
  "How much revenue has been billed vs collected across work orders?",
  "Analyze stale deals older than 90 days",
  "What are the top data quality issues I should know about?",
];

const TOOL_COLORS: Record<string, string> = {
  overview: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  pipeline: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  sectors: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  stages: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  health: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  revenue: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  owners: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  aging: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  top_clients: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  work_orders: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  data_quality: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `## Welcome to Skylark BI Copilot

I'm your **AI-powered Business Intelligence assistant** connected to Monday.com CRM data.

I can answer questions about:
- 📊 **Deals Pipeline** — pipeline value, deal stages, revenue forecasts
- 🏭 **Work Orders** — execution status, billing & collections, AR
- 🏢 **Sector Performance** — industry breakdowns, opportunity areas
- 👥 **Sales Team** — BD/KAM leaderboard, owner performance
- ⚠️ **Data Quality** — missing fields, reliability caveats

Try one of the suggested questions or ask me anything about the business.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);
    setShowPresets(false);

    try {
      const res = await sendChatMessage(query);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tool_used: res.tool_used,
        insights: res.insights,
        risks: res.risks,
        recommendations: res.recommendations,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: '⚠️ I encountered an issue connecting to the backend. Please ensure the FastAPI server is running on `localhost:8000`.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{
      id: 'cleared',
      sender: 'assistant',
      text: 'Conversation cleared. Ask me a new business intelligence question.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setShowPresets(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0a0f1e]/70 backdrop-blur-sm">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-[480px] bg-[#0d1428] border-l border-[#1e2d4a] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1e2d4a] px-5 py-4 bg-[#0a0f1e]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-500/30 shadow-md shadow-blue-900/30">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  AI Business Copilot
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                    Gemini Flash
                  </span>
                </h2>
                <p className="text-[10px] text-slate-500">Monday.com · Deals + Work Orders</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={handleClear} className="rounded-lg p-1.5 text-slate-500 hover:bg-[#1a2540] hover:text-slate-300 transition-colors" title="Clear Chat">
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-[#1a2540] hover:text-slate-300 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preset Suggestions */}
          {showPresets && (
            <div className="border-b border-[#1e2d4a] bg-[#0a0f1e]/50 px-5 py-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Suggested Questions</p>
              <div className="flex flex-col gap-1.5">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="flex items-center justify-between rounded-lg border border-[#1e2d4a] bg-[#111827] px-3 py-2 text-[11px] text-slate-300 hover:border-blue-500/30 hover:bg-[#151e32] transition-all text-left group"
                  >
                    <span>{q}</span>
                    <ArrowRight className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-700 border border-blue-600/30 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                )}

                <div className={`max-w-[88%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-tr-none border border-blue-500/30'
                    : 'bg-[#111827] border border-[#1e2d4a] text-slate-200 rounded-tl-none'
                }`}>
                  {/* Tool badge */}
                  {msg.tool_used && (
                    <div className={`mb-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${TOOL_COLORS[msg.tool_used] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      <Cpu className="h-2.5 w-2.5" />
                      Tool: {msg.tool_used.replace('_', ' ')}
                    </div>
                  )}

                  <div className="prose prose-invert prose-xs max-w-none [&_h2]:text-xs [&_h2]:font-bold [&_h3]:text-[11px] [&_h3]:font-semibold [&_ul]:pl-4 [&_li]:my-0.5">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  <p className={`mt-2 text-[9px] text-right ${msg.sender === 'user' ? 'text-blue-200/60' : 'text-slate-600'}`}>
                    {msg.timestamp}
                  </p>
                </div>

                {msg.sender === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1a2540] border border-[#243558] mt-0.5">
                    <User className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-700 border border-blue-600/30">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="rounded-xl bg-[#111827] border border-[#1e2d4a] px-4 py-3 text-[11px] text-slate-400 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
                  </div>
                  <span>Analyzing business data…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#1e2d4a] p-4 bg-[#0a0f1e]">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about pipeline, work orders, revenue…"
                className="flex-1 rounded-xl border border-[#1e2d4a] bg-[#111827] px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:opacity-40 border border-blue-500/30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <p className="mt-2 text-center text-[9px] text-slate-600">
              Powered by Google Gemini AI · Monday.com CRM Integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
