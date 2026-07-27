from fastapi import APIRouter

from app.services.conversation_memory import conversation_memory
from app.config import GEMINI_API_KEY
from app.repositories.monday_repository import MondayRepository

from app.services.analytics import BusinessAnalytics
from app.services.business_health import BusinessHealthService
from app.services.gemini_service import gemini_service
from app.services.insight_engine import InsightEngine
from app.services.monday_service import MondayService
from app.services.tool_planner import ToolPlanner
from app.services.advanced_analytics import AdvancedAnalytics

from app.api.dashboard_routes import router as dashboard_router
from app.api.report_routes import router as report_router
from app.api.auth_routes import router as auth_router

from app.schemas.chat import ChatRequest
from app.schemas.response import ChatResponse

router = APIRouter()

# Register nested routers
router.include_router(dashboard_router)
router.include_router(report_router)
router.include_router(auth_router)


# ==========================================================
# HOME & HEALTH CHECK
# ==========================================================

@router.get("/")
def home():
    return {
        "status": "online",
        "service": "Skylark BI Copilot API",
        "version": "1.0.0",
        "documentation": "/docs"
    }


# ==========================================================
# ANALYTICS (Legacy / Direct endpoints)
# ==========================================================

@router.get("/analytics/overview")
def overview():
    deals = MondayRepository.get_deals()
    return BusinessAnalytics.overview(deals)


@router.get("/analytics/sectors")
def sectors():
    deals = MondayRepository.get_deals()
    return BusinessAnalytics.sector_breakdown(deals)


@router.get("/analytics/stages")
def stages():
    deals = MondayRepository.get_deals()
    return BusinessAnalytics.deal_stage(deals)


@router.get("/analytics/business-health")
def business_health():
    deals = MondayRepository.get_deals()
    return BusinessHealthService.calculate(deals)


# ==========================================================
# MONDAY API
# ==========================================================

@router.get("/monday/boards")
def monday_boards():
    return MondayService.get_boards()


@router.get("/monday/deals")
def monday_deals():
    return MondayService.get_board_items(5030219244)


@router.get("/monday/workorders")
def monday_workorders():
    return MondayService.get_board_items(5030219254)


@router.get("/monday/deals/columns")
def monday_deal_columns():
    return MondayService.get_columns(5030219244)


@router.get("/monday/workorders/columns")
def monday_workorder_columns():
    return MondayService.get_columns(5030219254)


@router.get("/monday/items/{board_id}")
def monday_board_items(board_id: int):
    return MondayService.get_board_items(board_id)


# ==========================================================
# AI TEST & MODELS
# ==========================================================

@router.get("/test/gemini")
def test_gemini():
    response_text = gemini_service.generate_response("Say hello in one sentence.")
    return {"response": response_text}


@router.get("/test/models")
def list_models():
    try:
        if not GEMINI_API_KEY:
            return {"status": "GEMINI_API_KEY missing", "models": []}
        from google import genai  # lazy import — avoids startup crash if package missing
        client = genai.Client(api_key=GEMINI_API_KEY)
        models = []
        for model in client.models.list():
            models.append({
                "name": model.name,
                "display_name": getattr(model, "display_name", ""),
                "description": getattr(model, "description", "")
            })
        return {"count": len(models), "models": models}
    except Exception as e:
        return {"error": str(e)}


# ==========================================================
# AI CHAT WITH AI TOOL PLANNER
# ==========================================================

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    session_id = request.session_id or "default"

    # Save user message in memory
    conversation_memory.add_message(
        session_id=session_id,
        role="user",
        content=request.message
    )

    # Retrieve history
    history = conversation_memory.get_history(session_id)
    history_text = ""
    for msg in history:
        history_text += f"{msg['role'].upper()}: {msg['content']}\n"

    # Dynamic AI Tool Planning & Execution
    selected_tool, tool_data = ToolPlanner.plan_and_execute(request.message)

    # Fetch baseline analytics & health summary for report context
    deals = MondayRepository.get_deals()
    kpi_summary = AdvancedAnalytics.kpi_summary(deals)
    health_summary = BusinessHealthService.calculate(deals)

    report_context = {
        "tool_selected": selected_tool,
        "tool_result": tool_data,
        "overall_kpi": kpi_summary,
        "business_health": health_summary,
    }

    # Generate insights from insight engine
    report_insights = InsightEngine.generate(kpi_summary)

    # Build Prompt for Gemini
    prompt = f"""
You are Skylark BI Copilot, an enterprise Business Intelligence AI.

Previous Conversation:
{history_text}

Current User Question:
{request.message}

AI Tool Selected & Executed: "{selected_tool}"
Executed Tool Data Result:
{tool_data}

Baseline Business Metrics:
{kpi_summary}

Business Health & Risks:
{health_summary}

Instructions:
1. Deliver an executive answer directly addressing the user's question using the executed tool data.
2. If the user's query is ambiguous (e.g. asking for "this quarter" without specifying calendar vs fiscal, or ambiguous sector taxonomies), briefly provide the most likely interpretation while explicitly offering 1-2 clarifying options for the founder.
3. Structure your response with markdown formatting:
   - **Executive Summary**
   - **Key Analysis & Data Highlights**
   - **Data Quality & Caveats** (Explicitly list missing fields, assumptions made, or record linking notes)
   - **Strategic Next Steps**
4. Maintain a professional, executive tone suitable for senior business leaders.
"""

    answer = gemini_service.generate_response(prompt)

    # Save Assistant response to conversation memory
    conversation_memory.add_message(
        session_id=session_id,
        role="assistant",
        content=answer
    )

    return ChatResponse(
        answer=answer,
        summary=report_context,
        insights=report_insights.get("insights", []),
        risks=report_insights.get("risks", []),
        recommendations=report_insights.get("recommendations", []),
        tool_used=selected_tool,
        tool_data=tool_data,
    )