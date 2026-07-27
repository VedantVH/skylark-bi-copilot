import requests

from app.config import MONDAY_API_KEY, MONDAY_API_URL


class MondayService:
    """
    Service for interacting with monday.com GraphQL API.
    """

    @staticmethod
    def execute_query(query: str, variables: dict = None):

        headers = {
            "Authorization": MONDAY_API_KEY,
            "Content-Type": "application/json",
        }

        payload = {
            "query": query,
            "variables": variables or {},
        }

        response = requests.post(
            MONDAY_API_URL,
            json=payload,
            headers=headers,
            timeout=30,
        )

        response.raise_for_status()

        result = response.json()

        if "errors" in result:
            raise Exception(result["errors"])

        return result["data"]

    # --------------------------------------------------
    # Boards
    # --------------------------------------------------

    @staticmethod
    def get_boards():

        query = """
        query {
            boards {
                id
                name
            }
        }
        """

        return MondayService.execute_query(query)

    # --------------------------------------------------
    # Single Board
    # --------------------------------------------------

    @staticmethod
    def get_board(board_id: int):

        query = """
        query ($boardId: ID!) {
            boards(ids: [$boardId]) {
                id
                name
            }
        }
        """

        variables = {
            "boardId": str(board_id)
        }

        return MondayService.execute_query(query, variables)

    # --------------------------------------------------
    # Board Items
    # --------------------------------------------------

    @staticmethod
    def get_board_items(board_id: int):

        query = """
        query ($boardId: ID!) {
            boards(ids: [$boardId]) {

                id
                name

                items_page(limit: 500) {

                    items {

                        id
                        name

                        column_values {

                            id
                            text
                            type
                            value
                        }
                    }
                }
            }
        }
        """

        variables = {
            "boardId": str(board_id)
        }

        return MondayService.execute_query(query, variables)

    # --------------------------------------------------
    # Column Metadata
    # --------------------------------------------------

    @staticmethod
    def get_columns(board_id: int):

        query = """
        query ($boardId: ID!) {

            boards(ids: [$boardId]) {

                columns {
                    id
                    title
                    type
                }

            }
        }
        """

        variables = {
            "boardId": str(board_id)
        }

        return MondayService.execute_query(query, variables)