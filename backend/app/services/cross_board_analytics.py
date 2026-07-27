import pandas as pd
from typing import Dict, List, Any
from app.repositories.monday_repository import MondayRepository
from app.services.cleaner import DataCleaner

class CrossBoardAnalytics:
    """
    Executes cross-board join logic between Deals Funnel and Work Order Tracker.
    Joins deals and work orders by normalized Client Code.
    """

    @classmethod
    def deals_to_workorders_conversion(cls) -> Dict[str, Any]:
        deals_df = MondayRepository.get_deals()
        wo_df = MondayRepository.get_work_orders()

        if deals_df.empty or wo_df.empty:
            return {
                "joined_clients_count": 0,
                "total_pipeline_val": 0,
                "total_workorder_val": 0,
                "matched_records": [],
                "caveats": ["Missing deals or work orders data for cross-board join."]
            }

        # Normalize client codes in both datasets
        deals_df["norm_client"] = deals_df["text_mm5n2nh0"].apply(DataCleaner.normalize_client_name)
        wo_df["norm_client"] = wo_df["Customer Name Code"].apply(DataCleaner.normalize_client_name)

        deals_val_col = "numeric_mm5nvwfz"
        wo_val_col = "Amount in Rupees (Excl of GST) (Masked)"

        deals_df["deal_val"] = deals_df[deals_val_col].apply(DataCleaner.clean_currency)
        wo_df["wo_val"] = wo_df[wo_val_col].apply(DataCleaner.clean_currency)

        deals_grouped = deals_df.groupby("norm_client").agg(
            deal_count=("deal_val", "count"),
            pipeline_value=("deal_val", "sum")
        ).reset_index()

        wo_grouped = wo_df.groupby("norm_client").agg(
            wo_count=("wo_val", "count"),
            executed_value=("wo_val", "sum")
        ).reset_index()

        joined = pd.merge(deals_grouped, wo_grouped, on="norm_client", how="inner")

        matched_clients = []
        for _, row in joined.head(15).iterrows():
            matched_clients.append({
                "client_code": row["norm_client"],
                "active_deals": int(row["deal_count"]),
                "pipeline_value": round(float(row["pipeline_value"]), 2),
                "work_orders": int(row["wo_count"]),
                "executed_value": round(float(row["executed_value"]), 2)
            })

        return {
            "joined_clients_count": len(joined),
            "total_matched_pipeline": round(float(joined["pipeline_value"].sum()), 2),
            "total_matched_execution": round(float(joined["executed_value"].sum()), 2),
            "top_converted_clients": matched_clients,
            "caveats": [
                f"Joined {len(joined)} clients present in both Deals and Work Orders boards.",
                "Matching uses normalized client codes (e.g. COMPANY007)."
            ]
        }
