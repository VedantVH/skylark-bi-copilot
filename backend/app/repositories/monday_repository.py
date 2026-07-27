import os
import pandas as pd

from app.services.monday_service import MondayService
from app.constants.monday_columns import DEALS_COLUMNS, WO_EXCEL_TO_ID

DEALS_BOARD_ID = 5030219244
WORKORDER_BOARD_ID = 5030219254

DEALS_EXCEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../data/Deal funnel Data.xlsx")
)
WORKORDERS_EXCEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../data/Work_Order_Tracker Data.xlsx")
)


class MondayRepository:

    @staticmethod
    def dataframe(items) -> pd.DataFrame:
        """Convert Monday.com items (with column_values by column ID) to DataFrame."""
        records = []
        for item in items:
            row = {"name": item["name"]}
            for column in item["column_values"]:
                row[column["id"]] = column.get("text")
            records.append(row)
        return pd.DataFrame(records)

    # ------------------------------------------------------------------
    # DEALS
    # ------------------------------------------------------------------

    @classmethod
    def get_deals(cls) -> pd.DataFrame:
        """Fetch Deals from Monday.com live API; fallback to Excel dataset."""
        try:
            response = MondayService.get_board_items(DEALS_BOARD_ID)
            items = response["boards"][0]["items_page"]["items"]
            if items:
                return cls.dataframe(items)
        except Exception as e:
            print(f"[MondayRepository] Deals: Live API unavailable ({e}). Using local dataset.")

        return cls._get_deals_from_fallback()

    @classmethod
    def _get_deals_from_fallback(cls) -> pd.DataFrame:
        if os.path.exists(DEALS_EXCEL_PATH):
            df = pd.read_excel(DEALS_EXCEL_PATH)
            excel_mapping = {
                "Deal Name": "name",
                "Owner code": DEALS_COLUMNS["owner"],
                "Client Code": DEALS_COLUMNS["client"],
                "Deal Status": DEALS_COLUMNS["status"],
                "Close Date (A)": DEALS_COLUMNS["close_date"],
                "Closure Probability": DEALS_COLUMNS["probability"],
                "Masked Deal value": DEALS_COLUMNS["deal_value"],
                "Tentative Close Date": DEALS_COLUMNS["tentative_close"],
                "Deal Stage": DEALS_COLUMNS["stage"],
                "Product deal": DEALS_COLUMNS["product"],
                "Sector/service": DEALS_COLUMNS["sector"],
                "Created Date": DEALS_COLUMNS["created"],
            }
            return df.rename(columns=excel_mapping)
        return pd.DataFrame()

    # ------------------------------------------------------------------
    # WORK ORDERS
    # ------------------------------------------------------------------

    @classmethod
    def get_work_orders(cls) -> pd.DataFrame:
        """
        Fetch Work Orders from Monday.com live API.
        The live API returns column IDs (e.g. color_mm5nzm8r).
        We rename those to human-readable names matching the Excel headers
        so analytics works identically against both sources.
        Fallback to local Excel if API unavailable.
        """
        try:
            response = MondayService.get_board_items(WORKORDER_BOARD_ID)
            items = response["boards"][0]["items_page"]["items"]
            if items:
                df = cls.dataframe(items)
                # Remap Monday column IDs -> Excel-style human column names
                # Build reverse map: column_id -> excel_header
                id_to_excel = {v: k for k, v in WO_EXCEL_TO_ID.items() if v != "name"}
                df = df.rename(columns=id_to_excel)
                return df
        except Exception as e:
            print(f"[MondayRepository] Work Orders: Live API unavailable ({e}). Using local dataset.")

        return cls._get_work_orders_from_fallback()

    @classmethod
    def _get_work_orders_from_fallback(cls) -> pd.DataFrame:
        if os.path.exists(WORKORDERS_EXCEL_PATH):
            df = pd.read_excel(WORKORDERS_EXCEL_PATH, header=1)
            return df
        return pd.DataFrame()