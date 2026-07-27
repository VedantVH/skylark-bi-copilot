import pandas as pd

from app.constants.monday_columns import DEALS_COLUMNS


class BusinessAnalytics:

    @staticmethod
    def overview(df: pd.DataFrame):

        value_col = DEALS_COLUMNS["deal_value"]
        probability_col = DEALS_COLUMNS["probability"]

        # ----------------------------
        # Deal Value
        # ----------------------------
        df[value_col] = pd.to_numeric(
            df[value_col],
            errors="coerce"
        ).fillna(0)

        # ----------------------------
        # Probability Mapping
        # ----------------------------
        probability_map = {
            "High": 90,
            "Medium": 60,
            "Low": 30
        }

        probability = df[probability_col].map(probability_map)

        average_probability = (
            round(probability.dropna().mean(), 2)
            if not probability.dropna().empty
            else 0
        )

        # ----------------------------
        # Return Overview
        # ----------------------------
        return {
            "pipeline_value": round(df[value_col].sum(), 2),
            "active_deals": int(len(df)),
            "average_probability": average_probability,
            "high_probability_deals": int((df[probability_col] == "High").sum()),
            "medium_probability_deals": int((df[probability_col] == "Medium").sum()),
            "low_probability_deals": int((df[probability_col] == "Low").sum()),
            "missing_probability": int(df[probability_col].isna().sum())
        }

    @staticmethod
    def sector_breakdown(df: pd.DataFrame):

        sector_col = DEALS_COLUMNS["sector"]
        value_col = DEALS_COLUMNS["deal_value"]

        df[value_col] = pd.to_numeric(
            df[value_col],
            errors="coerce"
        ).fillna(0)

        sector_summary = (
            df.groupby(sector_col)[value_col]
            .agg(["count", "sum"])
            .sort_values("sum", ascending=False)
            .reset_index()
        )

        result = []

        for _, row in sector_summary.iterrows():
            result.append({
                "sector": row[sector_col] if pd.notna(row[sector_col]) else "Unknown",
                "deal_count": int(row["count"]),
                "pipeline_value": round(float(row["sum"]), 2)
            })

        return result

    @staticmethod
    def deal_stage(df: pd.DataFrame):

        stage_col = DEALS_COLUMNS["stage"]

        stage_counts = (
            df[stage_col]
            .fillna("Unknown")
            .value_counts()
        )

        return [
            {
                "stage": stage,
                "count": int(count)
            }
            for stage, count in stage_counts.items()
        ]