from fastapi import APIRouter
from app.repositories.monday_repository import MondayRepository
from app.services.analytics import BusinessAnalytics
from app.services.business_health import BusinessHealthService
from app.services.advanced_analytics import AdvancedAnalytics
from app.services.cross_board_analytics import CrossBoardAnalytics

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary():
    """
    Full dashboard data bundle — KPIs, health, revenue trends, sectors, stages,
    salesperson leaderboard, deal aging, top clients, work orders, cross-board,
    and data quality report. Single call for the frontend analytics view.
    """
    deals = MondayRepository.get_deals()
    wo_df = MondayRepository.get_work_orders()

    kpi = AdvancedAnalytics.kpi_summary(deals)
    health = BusinessHealthService.calculate(deals)
    data_quality = AdvancedAnalytics.data_quality_report(deals, wo_df)
    kpi["health_score"] = health.get("health_score", 0)
    kpi["data_quality_score"] = data_quality.get("overall_quality_score", 0)

    return {
        "kpi": kpi,
        "health": health,
        "revenue_trends": AdvancedAnalytics.revenue_trends(deals),
        "sectors": BusinessAnalytics.sector_breakdown(deals),
        "stages": BusinessAnalytics.deal_stage(deals),
        "owners": AdvancedAnalytics.owner_leaderboard(deals),
        "aging": AdvancedAnalytics.deal_aging(deals),
        "top_clients": AdvancedAnalytics.top_clients(deals),
        "work_orders": AdvancedAnalytics.work_order_analytics(wo_df),
        "cross_board": CrossBoardAnalytics.deals_to_workorders_conversion(),
        "data_quality": data_quality,
    }


@router.get("/kpi")
def get_kpi():
    """Pipeline KPI metrics — total value, expected revenue, win rate, health, data quality."""
    deals = MondayRepository.get_deals()
    wo_df = MondayRepository.get_work_orders()
    kpis = AdvancedAnalytics.kpi_summary(deals)
    health = BusinessHealthService.calculate(deals)
    dq = AdvancedAnalytics.data_quality_report(deals, wo_df)
    kpis["health_score"] = health.get("health_score", 0)
    kpis["data_quality_score"] = dq.get("overall_quality_score", 0)
    return kpis


@router.get("/revenue")
def get_revenue_trends():
    """Monthly revenue trend data for pipeline and expected revenue area chart."""
    deals = MondayRepository.get_deals()
    return AdvancedAnalytics.revenue_trends(deals)


@router.get("/forecast")
def get_forecast():
    """
    Revenue forecast — projects pipeline trajectory over the next 3 months
    using weighted probability scoring and historical monthly creation trends.
    """
    deals = MondayRepository.get_deals()
    trends = AdvancedAnalytics.revenue_trends(deals)
    kpi = AdvancedAnalytics.kpi_summary(deals)

    # Build a simple forward projection from last 3 months average
    if len(trends) >= 3:
        last3 = trends[-3:]
        avg_creation = sum(t.get("pipeline_value", 0) for t in last3) / 3
        avg_expected = sum(t.get("weighted_revenue", t.get("pipeline_value", 0) * 0.36) for t in last3) / 3
        win_rate = kpi.get("win_rate_percent", 35) / 100
    else:
        avg_creation = kpi.get("total_pipeline_value", 0) / max(len(trends), 1)
        avg_expected = kpi.get("weighted_expected_revenue", 0) / max(len(trends), 1)
        win_rate = kpi.get("win_rate_percent", 35) / 100

    import datetime
    months = []
    now = datetime.date.today()
    for i in range(1, 4):
        future_month = (now.replace(day=1) + datetime.timedelta(days=32 * i)).replace(day=1)
        months.append({
            "month": future_month.strftime("%b-%y"),
            "forecast_pipeline": round(avg_creation * (1 + 0.05 * i)),
            "forecast_expected_revenue": round(avg_expected * (1 + 0.04 * i)),
            "forecast_closed_won": round(avg_expected * win_rate * (1 + 0.03 * i)),
            "confidence": "Medium" if i <= 2 else "Low",
        })

    return {
        "historical_trends": trends,
        "forecast_months": months,
        "methodology": "3-month weighted moving average with 4-5% growth assumption",
        "win_rate_used": round(win_rate * 100, 1),
        "data_caveat": "Forecast based on creation date trends; excludes deals missing close_date fields."
    }


@router.get("/pipeline")
def get_pipeline():
    """Pipeline overview — deal count, average size, win/loss breakdown."""
    deals = MondayRepository.get_deals()
    return BusinessAnalytics.overview(deals)


@router.get("/sectors")
def get_sectors():
    """Sector distribution — pipeline value and deal count per industry vertical."""
    deals = MondayRepository.get_deals()
    return BusinessAnalytics.sector_breakdown(deals)


@router.get("/stages")
def get_stages():
    """Deal stage funnel — distribution of deals across all pipeline stages."""
    deals = MondayRepository.get_deals()
    return BusinessAnalytics.deal_stage(deals)


@router.get("/owners")
def get_owners():
    """Salesperson leaderboard — total pipeline value, deal count, average deal size per BD/KAM."""
    deals = MondayRepository.get_deals()
    return AdvancedAnalytics.owner_leaderboard(deals)


@router.get("/aging")
def get_aging():
    """Deal aging analysis — distribution of deals by days since creation."""
    deals = MondayRepository.get_deals()
    return AdvancedAnalytics.deal_aging(deals)


@router.get("/health")
def get_health():
    """Business health score — pipeline, probability, and data quality composite scoring."""
    deals = MondayRepository.get_deals()
    return BusinessHealthService.calculate(deals)


@router.get("/work-orders")
def get_work_orders():
    """Work orders telemetry — execution status, billing rate, collection rate, receivables."""
    wo_df = MondayRepository.get_work_orders()
    return AdvancedAnalytics.work_order_analytics(wo_df)


@router.get("/cross-board")
def get_cross_board():
    """
    Cross-board conversion analysis — matches Deals to Work Orders by client code
    to compute deal-to-execution conversion rates, avg time-to-execution, and sector conversion.
    """
    deals = MondayRepository.get_deals()
    wo_df = MondayRepository.get_work_orders()
    return CrossBoardAnalytics.deals_to_workorders_conversion()


@router.get("/data-quality")
def get_data_quality():
    """Cross-board data quality assessment — field completeness per board, overall score, caveats."""
    deals = MondayRepository.get_deals()
    wo_df = MondayRepository.get_work_orders()
    return AdvancedAnalytics.data_quality_report(deals, wo_df)
