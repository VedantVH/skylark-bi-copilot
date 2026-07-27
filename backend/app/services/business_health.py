from app.constants.monday_columns import DEALS_COLUMNS


class BusinessHealthService:

    @staticmethod
    def calculate(deals):

        probability_col = DEALS_COLUMNS["probability"]

        total_deals = len(deals)

        high = (deals[probability_col] == "High").sum()
        medium = (deals[probability_col] == "Medium").sum()
        low = (deals[probability_col] == "Low").sum()
        missing = deals[probability_col].isna().sum()

        # ----------------------------
        # Pipeline Score
        # ----------------------------

        if high >= 50:
            pipeline_score = 95
        elif high >= 20:
            pipeline_score = 85
        elif high >= 10:
            pipeline_score = 75
        else:
            pipeline_score = 60

        # ----------------------------
        # Probability Score
        # ----------------------------

        if total_deals == 0:
            probability_score = 0
        else:
            probability_score = round(
                ((high * 90) + (medium * 60) + (low * 30))
                / total_deals,
                2
            )

        # ----------------------------
        # Data Quality
        # ----------------------------

        if total_deals == 0:
            data_quality_score = 100
        else:
            data_quality_score = round(
                (1 - (missing / total_deals)) * 100,
                2
            )

        # ----------------------------
        # Final Health
        # ----------------------------

        health_score = round(
            (
                pipeline_score +
                probability_score +
                data_quality_score
            ) / 3,
            2
        )

        # ----------------------------
        # Status
        # ----------------------------

        if health_score >= 85:
            status = "Excellent"
        elif health_score >= 70:
            status = "Healthy"
        elif health_score >= 50:
            status = "Needs Attention"
        else:
            status = "Critical"

        # ----------------------------
        # Recommendations
        # ----------------------------

        recommendations = []

        if missing > 0:
            recommendations.append(
                "Complete missing Closure Probability values."
            )

        if low > high:
            recommendations.append(
                "Increase focus on converting low-probability deals."
            )

        if high < 10:
            recommendations.append(
                "Build a stronger pipeline of high-probability opportunities."
            )

        if not recommendations:
            recommendations.append(
                "Business pipeline is performing well."
            )

        return {
            "health_score": health_score,
            "status": status,
            "pipeline_score": pipeline_score,
            "probability_score": probability_score,
            "data_quality_score": data_quality_score,
            "high_probability_deals": int(high),
            "medium_probability_deals": int(medium),
            "low_probability_deals": int(low),
            "missing_probability": int(missing),
            "recommendations": recommendations
        }