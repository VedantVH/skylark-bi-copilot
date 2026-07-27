class QueryRouter:

    @staticmethod
    def detect_intent(question: str):

        q = question.lower()

        if "pipeline" in q:
            return "pipeline"

        if "sector" in q:
            return "sector"

        if "stage" in q:
            return "stage"

        if "revenue" in q:
            return "revenue"

        if "work order" in q:
            return "work_orders"

        return "general"