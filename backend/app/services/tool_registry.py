from app.repositories.monday_repository import MondayRepository
from app.services.analytics import BusinessAnalytics
from app.services.business_health import BusinessHealthService
from app.services.advanced_analytics import AdvancedAnalytics
from app.services.cross_board_analytics import CrossBoardAnalytics


class ToolRegistry:

    @staticmethod
    def pipeline():
        deals = MondayRepository.get_deals()
        return BusinessAnalytics.overview(deals)

    @staticmethod
    def sectors():
        deals = MondayRepository.get_deals()
        return BusinessAnalytics.sector_breakdown(deals)

    @staticmethod
    def stages():
        deals = MondayRepository.get_deals()
        return BusinessAnalytics.deal_stage(deals)

    @staticmethod
    def health():
        deals = MondayRepository.get_deals()
        return BusinessHealthService.calculate(deals)

    @staticmethod
    def revenue():
        deals = MondayRepository.get_deals()
        return {
            "kpi": AdvancedAnalytics.kpi_summary(deals),
            "trends": AdvancedAnalytics.revenue_trends(deals),
        }

    @staticmethod
    def owners():
        deals = MondayRepository.get_deals()
        return AdvancedAnalytics.owner_leaderboard(deals)

    @staticmethod
    def aging():
        deals = MondayRepository.get_deals()
        return AdvancedAnalytics.deal_aging(deals)

    @staticmethod
    def top_clients():
        deals = MondayRepository.get_deals()
        return AdvancedAnalytics.top_clients(deals)

    @staticmethod
    def work_orders():
        """Operational metrics from Work Orders board — execution, billing & collections."""
        wo_df = MondayRepository.get_work_orders()
        return AdvancedAnalytics.work_order_analytics(wo_df)

    @staticmethod
    def data_quality():
        """Cross-board data quality score and caveats for executive transparency."""
        deals = MondayRepository.get_deals()
        wo_df = MondayRepository.get_work_orders()
        return AdvancedAnalytics.data_quality_report(deals, wo_df)

    @staticmethod
    def cross_board():
        """Joined analytics linking Deals Funnel with Work Orders by client code."""
        return CrossBoardAnalytics.deals_to_workorders_conversion()

    @staticmethod
    def overview():
        deals = MondayRepository.get_deals()
        return {
            "kpi": AdvancedAnalytics.kpi_summary(deals),
            "health": BusinessHealthService.calculate(deals),
            "sectors": BusinessAnalytics.sector_breakdown(deals),
            "stages": BusinessAnalytics.deal_stage(deals),
        }