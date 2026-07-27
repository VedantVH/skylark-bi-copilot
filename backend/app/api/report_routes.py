from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse
import io
from app.repositories.monday_repository import MondayRepository
from app.services.advanced_analytics import AdvancedAnalytics
from app.services.business_health import BusinessHealthService
from app.services.gemini_service import gemini_service
from app.services.insight_engine import InsightEngine

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/executive-summary")
def get_executive_report():
    """
    Generates a full board-level executive summary with KPIs, health score,
    AI insights, risks, and strategic recommendations synthesized by Gemini AI.
    """
    deals = MondayRepository.get_deals()
    wo_df = MondayRepository.get_work_orders()
    kpi = AdvancedAnalytics.kpi_summary(deals)
    health = BusinessHealthService.calculate(deals)
    wo_analytics = AdvancedAnalytics.work_order_analytics(wo_df)
    dq = AdvancedAnalytics.data_quality_report(deals, wo_df)
    insights = InsightEngine.generate(kpi)

    prompt = f"""
Generate a concise, professional Executive Business Intelligence Briefing for the Board of Directors.

Skylark Drones — Business Performance Summary:
- Total Pipeline Value: ₹{kpi.get('total_pipeline_value', 0)/1e7:.2f} Cr
- Weighted Expected Revenue (Probability-Adjusted): ₹{kpi.get('weighted_expected_revenue', 0)/1e7:.2f} Cr
- Active Deals: {kpi.get('active_deals_count', 0)}
- Estimated Win Rate: {kpi.get('win_rate_percent', 0)}%
- Stale Deals (90+ days): {kpi.get('stale_deals_count', 0)}
- Business Health Score: {health.get('health_score', 0)}/100
- Work Order Contract Value: ₹{wo_analytics.get('total_contract_value', 0)/1e7:.2f} Cr
- Billing Rate: {wo_analytics.get('billing_rate_percent', 0)}%
- Collection Rate: {wo_analytics.get('collection_rate_percent', 0)}%
- Outstanding Receivables: ₹{wo_analytics.get('outstanding_receivables', 0)/1e5:.1f} L
- Data Quality Score: {dq.get('overall_quality_score', 0)}%

Format with markdown:
## Executive Summary
## Key Business Highlights
## Risks & Concerns
## Strategic Recommendations for Next 30 Days
"""

    summary_text = gemini_service.generate_response(prompt)

    return {
        "title": "Skylark BI Copilot — Board Intelligence Report",
        "kpi": kpi,
        "health": health,
        "work_orders": wo_analytics,
        "data_quality": dq,
        "insights": insights.get("insights", []),
        "risks": insights.get("risks", []),
        "recommendations": insights.get("recommendations", []),
        "executive_brief": summary_text,
    }


@router.get("/export-csv")
def export_pipeline_csv():
    """Exports the full active deals pipeline as a downloadable CSV file."""
    deals = MondayRepository.get_deals()
    output = io.StringIO()
    deals.to_csv(output, index=False)
    output.seek(0)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="skylark_deals_pipeline.csv"'}
    )


@router.get("/export-workorders-csv")
def export_workorders_csv():
    """Exports the work orders dataset as a downloadable CSV file."""
    wo_df = MondayRepository.get_work_orders()
    output = io.StringIO()
    wo_df.to_csv(output, index=False)
    output.seek(0)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="skylark_work_orders.csv"'}
    )


@router.get("/data-quality")
def get_data_quality_report():
    """Returns a detailed cross-board data quality report with field completeness."""
    deals = MondayRepository.get_deals()
    wo_df = MondayRepository.get_work_orders()
    return AdvancedAnalytics.data_quality_report(deals, wo_df)


@router.get("/weekly-summary")
def get_weekly_summary():
    """
    Generates a brief weekly executive digest — top movers, stale risks, and action items.
    """
    deals = MondayRepository.get_deals()
    kpi = AdvancedAnalytics.kpi_summary(deals)
    aging = AdvancedAnalytics.deal_aging(deals)
    owners = AdvancedAnalytics.owner_leaderboard(deals)

    stale_bucket = next((b for b in aging if '90' in b.get('bucket', '')), None)
    stale_count = stale_bucket['count'] if stale_bucket else kpi.get('stale_deals_count', 0)

    top_owner = owners[0] if owners else {}

    prompt = f"""
Write a short, punchy Weekly Business Digest (max 200 words) for Skylark Drones leadership.

This week at a glance:
- Pipeline: ₹{kpi.get('total_pipeline_value', 0)/1e7:.1f}Cr across {kpi.get('active_deals_count', 0)} deals
- Stale deals (90+ days with no movement): {stale_count}
- Top performer: {top_owner.get('owner', 'N/A')} with ₹{top_owner.get('total_value', 0)/1e7:.1f}Cr pipeline

Cover: what's going well, what needs attention, and one action item.
"""
    digest = gemini_service.generate_response(prompt)
    return {
        "period": "Weekly Digest",
        "kpi_snapshot": kpi,
        "stale_deal_count": stale_count,
        "top_owner": top_owner,
        "digest": digest,
    }
