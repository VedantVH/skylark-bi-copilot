import json
import re
from app.services.gemini_service import gemini_service
from app.services.tool_registry import ToolRegistry


class ToolPlanner:

    VALID_TOOLS = [
        "overview",
        "pipeline",
        "sectors",
        "stages",
        "health",
        "revenue",
        "owners",
        "aging",
        "top_clients",
        "work_orders",
        "data_quality",
        "cross_board",
    ]

    @classmethod
    def plan_and_execute(cls, question: str) -> tuple[str, dict]:
        """
        Uses Gemini to evaluate user intent and execute the appropriate business tool.
        Returns a tuple of (selected_tool_name, tool_data_result).
        """
        prompt = f"""
You are an AI Tool Planner for a Business Intelligence Copilot connected to Monday.com CRM.
The platform has two data boards: (1) Deals / Sales Pipeline, (2) Work Orders / Project Execution.

Select ONLY ONE tool from the following list that best answers the user's question:

- overview: general business health, pipeline overview, or broad executive questions
- pipeline: pipeline value, active deals count, probability breakdown from Deals board
- sectors: industry sector performance, revenue by sector from Deals board
- stages: deal stages, pipeline funnel progression from Deals board
- health: business health score, data quality, risk assessment of Deals board
- revenue: revenue trends over time, expected weighted revenue from Deals board
- owners: salesperson leaderboard, owner breakdown, BD personnel performance from Deals board
- aging: deal age distribution, stale deals analysis from Deals board
- top_clients: top customers, key accounts by deal value from Deals board
- work_orders: operational execution status, billing vs collected amounts, work order financials, AR/receivables from Work Orders board
- data_quality: cross-board data quality score, field completeness, data caveats and warnings for executives
- cross_board: queries asking about conversion from deals to work orders, joining sales with project execution, or combined client portfolio analysis

User Question: "{question}"

Key routing hints:
- Questions asking to "join", "compare sales to execution", "converted deals", "deals that became work orders" → use cross_board
- Questions about "execution", "projects", "work orders", "billed", "collected", "receivables", "AR", "invoices" → use work_orders
- Questions about "data quality", "missing data", "completeness", "reliability" → use data_quality
- Questions about "pipeline", "deals", "revenue", "forecast", "won" → use pipeline or revenue
- Questions about "health" or "risk" → use health
- Questions about "sector", "industry", "energy", "mining" → use sectors
- Questions about "team", "sales rep", "BD", "owner" → use owners

Respond strictly with valid JSON only. No markdown, no explanation.
Example: {{"tool": "work_orders"}}
"""

        selected_tool = "overview"
        try:
            raw_response = gemini_service.generate_response(prompt)
            clean_json = re.sub(r"```(?:json)?|```", "", raw_response).strip()
            data = json.loads(clean_json)
            if "tool" in data and data["tool"] in cls.VALID_TOOLS:
                selected_tool = data["tool"]
        except Exception as e:
            print(f"[ToolPlanner] AI tool selection fallback: {e}")
            q_lower = question.lower()
            if any(w in q_lower for w in ["join", "converted", "became work order", "deals to execution"]):
                selected_tool = "cross_board"
            elif any(w in q_lower for w in ["execution", "work order", "billed", "collected", "invoice", "receivable", "ar ", "billing"]):
                selected_tool = "work_orders"
            elif any(w in q_lower for w in ["data quality", "missing", "completeness", "reliable", "caveat"]):
                selected_tool = "data_quality"
            elif any(w in q_lower for w in ["health", "risk", "score"]):
                selected_tool = "health"
            elif any(w in q_lower for w in ["sector", "industry", "energy", "mining", "agriculture"]):
                selected_tool = "sectors"
            elif any(w in q_lower for w in ["stage", "funnel"]):
                selected_tool = "stages"
            elif any(w in q_lower for w in ["owner", "salesperson", "rep", "bd "]):
                selected_tool = "owners"
            elif any(w in q_lower for w in ["revenue", "trend", "growth"]):
                selected_tool = "revenue"
            elif any(w in q_lower for w in ["age", "stale", "aging"]):
                selected_tool = "aging"
            elif any(w in q_lower for w in ["client", "customer", "account"]):
                selected_tool = "top_clients"

        tool_func = getattr(ToolRegistry, selected_tool, ToolRegistry.overview)
        try:
            result_data = tool_func()
        except Exception as e:
            print(f"[ToolPlanner] Tool execution error: {e}")
            result_data = ToolRegistry.overview()

        return selected_tool, result_data