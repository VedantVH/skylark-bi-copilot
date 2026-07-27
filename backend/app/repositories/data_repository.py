from pathlib import Path
import pandas as pd

from app.services.cleaner import DataCleaner


class DataRepository:

    BASE_DIR = Path(__file__).resolve().parents[3]
    DATA_DIR = BASE_DIR / "data"

    @classmethod
    def get_deals(cls):

        df = pd.read_excel(cls.DATA_DIR / "Deal funnel Data.xlsx")

        df["Masked Deal value"] = (
            df["Masked Deal value"]
            .apply(DataCleaner.clean_currency)
        )

        df["Closure Probability"] = (
            df["Closure Probability"]
            .apply(DataCleaner.clean_probability)
        )

        df["Sector/service"] = (
            df["Sector/service"]
            .apply(DataCleaner.normalize_sector)
        )

        return df

    @classmethod
    def get_work_orders(cls):

        return pd.read_excel(
            cls.DATA_DIR / "Work_Order_Tracker Data.xlsx"
        )