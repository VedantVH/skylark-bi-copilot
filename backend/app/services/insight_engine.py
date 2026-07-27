class InsightEngine:

    @staticmethod
    def generate(summary):

        insights = []
        risks = []
        recommendations = []

        pipeline = summary.get("pipeline_value", 0)
        probability = summary.get("average_probability", 0)
        deals = summary.get("active_deals", 0)

        # Insights
        insights.append(
            f"Current pipeline value is ₹{pipeline:,.2f}."
        )

        insights.append(
            f"There are {deals} active deals."
        )

        # Risks
        if probability < 50:
            risks.append(
                "Average closure probability is below 50%."
            )

        if deals == 0:
            risks.append(
                "No active deals found."
            )

        # Recommendations
        if probability < 50:
            recommendations.append(
                "Prioritize high-probability opportunities."
            )

        if deals > 0:
            recommendations.append(
                "Review high-value deals expected to close this quarter."
            )

        return {
            "insights": insights,
            "risks": risks,
            "recommendations": recommendations,
        }