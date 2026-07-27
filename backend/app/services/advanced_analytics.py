import pandas as pd
from datetime import datetime
from typing import Dict, List, Any
from app.constants.monday_columns import DEALS_COLUMNS


class AdvancedAnalytics:

    @staticmethod
    def _clean_numeric(series: pd.Series) -> pd.Series:
        return pd.to_numeric(series, errors="coerce").fillna(0)

    @staticmethod
    def _clean_date(series: pd.Series) -> pd.Series:
        return pd.to_datetime(series, errors="coerce")

    @classmethod
    def kpi_summary(cls, df: pd.DataFrame) -> Dict[str, Any]:
        if df.empty:
            return {
                "total_pipeline_value": 0,
                "weighted_expected_revenue": 0,
                "active_deals_count": 0,
                "average_deal_size": 0,
                "win_rate_percent": 0.0,
                "stale_deals_count": 0,
            }

        val_col = DEALS_COLUMNS["deal_value"]
        prob_col = DEALS_COLUMNS["probability"]
        status_col = DEALS_COLUMNS["status"]

        deal_values = cls._clean_numeric(df[val_col])
        total_pipeline = round(float(deal_values.sum()), 2)
        total_count = len(df)
        avg_deal_size = round(total_pipeline / total_count, 2) if total_count > 0 else 0

        prob_weights = {"High": 0.90, "Medium": 0.60, "Low": 0.30}
        probabilities = df[prob_col].map(prob_weights).fillna(0.30)
        weighted_revenue = round(float((deal_values * probabilities).sum()), 2)

        won_deals = df[df[status_col].astype(str).str.lower().str.contains("won|closed", na=False)]
        win_rate = round((len(won_deals) / total_count) * 100, 1) if total_count > 0 else 0.0

        created_dates = cls._clean_date(df[DEALS_COLUMNS["created"]])
        now = pd.Timestamp.now()
        age_days = (now - created_dates).dt.days
        stale_count = int((age_days > 90).sum())

        return {
            "total_pipeline_value": total_pipeline,
            "weighted_expected_revenue": weighted_revenue,
            "active_deals_count": total_count,
            "average_deal_size": avg_deal_size,
            "win_rate_percent": win_rate,
            "stale_deals_count": stale_count,
        }

    @classmethod
    def revenue_trends(cls, df: pd.DataFrame) -> List[Dict[str, Any]]:
        if df.empty:
            return []

        val_col = DEALS_COLUMNS["deal_value"]
        date_col = DEALS_COLUMNS["created"]

        df_copy = df.copy()
        df_copy["deal_val"] = cls._clean_numeric(df_copy[val_col])
        df_copy["parsed_date"] = cls._clean_date(df_copy[date_col])

        valid_df = df_copy.dropna(subset=["parsed_date"]).copy()
        if valid_df.empty:
            return []

        valid_df["period"] = valid_df["parsed_date"].dt.strftime("%Y-%m")

        grouped = (
            valid_df.groupby("period")
            .agg(total_pipeline=("deal_val", "sum"), deal_count=("deal_val", "count"))
            .reset_index()
            .sort_values("period")
        )

        return [
            {"month": row["period"], "pipeline_value": round(float(row["total_pipeline"]), 2), "deal_count": int(row["deal_count"])}
            for _, row in grouped.iterrows()
        ]

    @classmethod
    def owner_leaderboard(cls, df: pd.DataFrame) -> List[Dict[str, Any]]:
        if df.empty:
            return []

        val_col = DEALS_COLUMNS["deal_value"]
        owner_col = DEALS_COLUMNS["owner"]

        df_copy = df.copy()
        df_copy["deal_val"] = cls._clean_numeric(df_copy[val_col])
        df_copy["owner_name"] = df_copy[owner_col].fillna("Unassigned")

        grouped = (
            df_copy.groupby("owner_name")
            .agg(total_value=("deal_val", "sum"), deal_count=("deal_val", "count"), avg_deal_value=("deal_val", "mean"))
            .reset_index()
            .sort_values("total_value", ascending=False)
        )

        return [
            {"owner": str(row["owner_name"]), "total_value": round(float(row["total_value"]), 2),
             "deal_count": int(row["deal_count"]), "avg_deal_value": round(float(row["avg_deal_value"]), 2)}
            for _, row in grouped.iterrows()
        ]

    @classmethod
    def deal_aging(cls, df: pd.DataFrame) -> List[Dict[str, Any]]:
        if df.empty:
            return []

        dates = cls._clean_date(df[DEALS_COLUMNS["created"]])
        vals = cls._clean_numeric(df[DEALS_COLUMNS["deal_value"]])
        now = pd.Timestamp.now()
        ages = (now - dates).dt.days.fillna(0)

        buckets = {
            "< 30 Days": {"count": 0, "value": 0.0},
            "30 - 60 Days": {"count": 0, "value": 0.0},
            "60 - 90 Days": {"count": 0, "value": 0.0},
            "90+ Days (Stale)": {"count": 0, "value": 0.0},
        }

        for age, val in zip(ages, vals):
            if age < 30:
                buckets["< 30 Days"]["count"] += 1; buckets["< 30 Days"]["value"] += val
            elif age <= 60:
                buckets["30 - 60 Days"]["count"] += 1; buckets["30 - 60 Days"]["value"] += val
            elif age <= 90:
                buckets["60 - 90 Days"]["count"] += 1; buckets["60 - 90 Days"]["value"] += val
            else:
                buckets["90+ Days (Stale)"]["count"] += 1; buckets["90+ Days (Stale)"]["value"] += val

        return [{"bucket": k, "count": v["count"], "pipeline_value": round(float(v["value"]), 2)} for k, v in buckets.items()]

    @classmethod
    def top_clients(cls, df: pd.DataFrame, limit: int = 10) -> List[Dict[str, Any]]:
        if df.empty:
            return []

        df_copy = df.copy()
        df_copy["deal_val"] = cls._clean_numeric(df_copy[DEALS_COLUMNS["deal_value"]])
        df_copy["client_name"] = df_copy[DEALS_COLUMNS["client"]].fillna("Unknown Client")

        grouped = (
            df_copy.groupby("client_name")
            .agg(total_value=("deal_val", "sum"), deal_count=("deal_val", "count"))
            .reset_index()
            .sort_values("total_value", ascending=False)
            .head(limit)
        )

        return [{"client": str(row["client_name"]), "total_value": round(float(row["total_value"]), 2), "deal_count": int(row["deal_count"])} for _, row in grouped.iterrows()]

    # ============================================================
    # WORK ORDERS ANALYTICS — Operational Intelligence
    # ============================================================

    @classmethod
    def work_order_analytics(cls, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Comprehensive operational metrics from Work Orders board.
        Handles messy real-world data gracefully with quality caveats.
        """
        if df.empty:
            return {
                "total_work_orders": 0,
                "total_contract_value": 0,
                "total_billed_value": 0,
                "total_collected": 0,
                "outstanding_receivables": 0,
                "execution_status_breakdown": {},
                "sector_breakdown": {},
                "billing_status_breakdown": {},
                "data_caveats": ["No work order data available."],
            }

        total = len(df)
        caveats = []

        # Financial metrics — gracefully handle missing/NaN
        contract_col = "Amount in Rupees (Excl of GST) (Masked)"
        billed_col = "Billed Value in Rupees (Excl of GST.) (Masked)"
        collected_col = "Collected Amount in Rupees (Incl of GST.) (Masked)"
        receivable_col = "Amount Receivable (Masked)"

        total_contract = 0.0
        total_billed = 0.0
        total_collected = 0.0
        total_receivable = 0.0

        if contract_col in df.columns:
            vals = cls._clean_numeric(df[contract_col])
            total_contract = round(float(vals.sum()), 2)
            missing = int(df[contract_col].isna().sum())
            if missing > 0:
                caveats.append(f"{missing}/{total} work orders are missing contract value amounts.")

        if billed_col in df.columns:
            total_billed = round(float(cls._clean_numeric(df[billed_col]).sum()), 2)

        if collected_col in df.columns:
            total_collected = round(float(cls._clean_numeric(df[collected_col]).sum()), 2)

        if receivable_col in df.columns:
            total_receivable = round(float(cls._clean_numeric(df[receivable_col]).sum()), 2)

        # Execution Status Breakdown
        exec_status = {}
        if "Execution Status" in df.columns:
            status_counts = df["Execution Status"].fillna("Unknown").value_counts()
            exec_status = {str(k): int(v) for k, v in status_counts.items()}
            null_statuses = int(df["Execution Status"].isna().sum())
            if null_statuses > 0:
                caveats.append(f"{null_statuses} work orders have no execution status recorded.")

        # Sector Breakdown for Work Orders
        sector_breakdown = {}
        sector_col = "Sector"
        if sector_col in df.columns:
            sector_counts = df[sector_col].fillna("Unknown").value_counts()
            sector_breakdown = {str(k): int(v) for k, v in sector_counts.items()}

        # Billing Status
        billing_status = {}
        if "Billing Status" in df.columns:
            bs_counts = df["Billing Status"].fillna("Unknown").value_counts()
            billing_status = {str(k): int(v) for k, v in bs_counts.items()}

        # Invoice Status
        invoice_status = {}
        if "Invoice Status" in df.columns:
            inv_counts = df["Invoice Status"].fillna("Unknown").value_counts()
            invoice_status = {str(k): int(v) for k, v in inv_counts.items()}

        # Nature of Work breakdown
        nature_breakdown = {}
        if "Nature of Work" in df.columns:
            nat_counts = df["Nature of Work"].fillna("Unknown").value_counts().head(10)
            nature_breakdown = {str(k): int(v) for k, v in nat_counts.items()}

        # Date quality caveats
        for date_col in ["Date of PO/LOI", "Probable Start Date", "Data Delivery Date"]:
            if date_col in df.columns:
                missing_dates = int(df[date_col].isna().sum())
                if missing_dates > total * 0.3:  # >30% missing
                    caveats.append(f"'{date_col}' is missing for {missing_dates}/{total} work orders — timeline analysis may be incomplete.")

        collection_rate = round((total_collected / total_billed * 100), 1) if total_billed > 0 else 0.0
        billing_rate = round((total_billed / total_contract * 100), 1) if total_contract > 0 else 0.0

        return {
            "total_work_orders": total,
            "total_contract_value": total_contract,
            "total_billed_value": total_billed,
            "total_collected": total_collected,
            "outstanding_receivables": total_receivable,
            "collection_rate_percent": collection_rate,
            "billing_rate_percent": billing_rate,
            "execution_status_breakdown": exec_status,
            "sector_breakdown": sector_breakdown,
            "billing_status_breakdown": billing_status,
            "invoice_status_breakdown": invoice_status,
            "nature_of_work_breakdown": nature_breakdown,
            "data_caveats": caveats if caveats else ["Work order data appears complete with no major quality issues."],
        }

    @classmethod
    def data_quality_report(cls, deals_df: pd.DataFrame, workorders_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Produces a cross-board data quality assessment with completeness metrics
        and explicit caveats for executive transparency.
        """
        report = {
            "deals_board": {},
            "work_orders_board": {},
            "overall_quality_score": 0,
            "caveats": [],
            "recommendations": [],
        }

        # --- Deals Board Quality ---
        if not deals_df.empty:
            deals_total = len(deals_df)
            deal_quality_checks = {}
            for field, col in DEALS_COLUMNS.items():
                if col in deals_df.columns:
                    completeness = round((1 - deals_df[col].isna().sum() / deals_total) * 100, 1)
                    deal_quality_checks[field] = completeness
            report["deals_board"] = {
                "total_records": deals_total,
                "field_completeness_percent": deal_quality_checks,
                "average_completeness": round(sum(deal_quality_checks.values()) / len(deal_quality_checks), 1) if deal_quality_checks else 0,
            }

        # --- Work Orders Board Quality ---
        if not workorders_df.empty:
            wo_total = len(workorders_df)
            key_wo_fields = [
                "Execution Status", "Sector", "Amount in Rupees (Excl of GST) (Masked)",
                "Date of PO/LOI", "Probable Start Date", "Billing Status", "Invoice Status",
                "Collected Amount in Rupees (Incl of GST.) (Masked)"
            ]
            wo_quality = {}
            for field in key_wo_fields:
                if field in workorders_df.columns:
                    completeness = round((1 - workorders_df[field].isna().sum() / wo_total) * 100, 1)
                    wo_quality[field.split("(")[0].strip()] = completeness
            avg_wo_quality = round(sum(wo_quality.values()) / len(wo_quality), 1) if wo_quality else 0
            report["work_orders_board"] = {
                "total_records": wo_total,
                "field_completeness_percent": wo_quality,
                "average_completeness": avg_wo_quality,
            }

        # --- Overall Score ---
        deals_avg = report.get("deals_board", {}).get("average_completeness", 0)
        wo_avg = report.get("work_orders_board", {}).get("average_completeness", 0)
        report["overall_quality_score"] = round((deals_avg + wo_avg) / 2, 1)

        # --- Caveats & Recommendations ---
        if deals_avg < 70:
            report["caveats"].append("Deals board has significant missing data — pipeline projections may be understated.")
        if wo_avg < 70:
            report["caveats"].append("Work Orders board has incomplete financial data — billing and collection figures may be conservative estimates.")
        if report["overall_quality_score"] >= 80:
            report["recommendations"].append("Data quality is strong. Projections can be relied upon for executive decision-making.")
        else:
            report["recommendations"].append("Improve Monday.com data entry discipline, particularly for financial amounts and close dates.")
            report["recommendations"].append("Consider using Monday automations to enforce required field completion on deal creation.")

        return report
