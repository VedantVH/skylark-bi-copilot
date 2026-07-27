import pandas as pd
import re
from typing import Optional, Dict, Any

class DataCleaner:
    """
    Data Normalization & Cleaning Layer.
    Implements explicit normalization rules:
    - Case-folding & whitespace trimming
    - Canonical sector mapping taxonomy
    - Canonical status mapping
    - Robust date parsing into ISO-8601 YYYY-MM-DD
    - Clean numeric/currency parsing
    - Cross-board record linking key normalization
    """

    SECTOR_TAXONOMY = {
        "energy": "Energy & Power",
        "power": "Energy & Power",
        "powerline": "Energy & Power",
        "transmission": "Energy & Power",
        "solar": "Energy & Power",
        "renewables": "Energy & Power",
        "renewable": "Energy & Power",
        "mining": "Mining & Resources",
        "minerals": "Mining & Resources",
        "railways": "Infrastructure & Logistics",
        "railway": "Infrastructure & Logistics",
        "infrastructure": "Infrastructure & Logistics",
        "construction": "Infrastructure & Logistics",
        "highways": "Infrastructure & Logistics",
        "agriculture": "Agriculture & Forestry",
        "farming": "Agriculture & Forestry",
        "others": "Others / Uncategorized",
        "other": "Others / Uncategorized"
    }

    STATUS_TAXONOMY = {
        "completed": "Completed",
        "complete": "Completed",
        "closed": "Completed",
        "won": "Closed Won",
        "g. project won": "Closed Won",
        "l. project lost": "Closed Lost",
        "ongoing": "In Progress",
        "in progress": "In Progress",
        "executed until current month": "In Progress",
        "partially completed": "In Progress",
        "not started": "Not Started",
        "a. lead generated": "Pipeline Lead",
        "paused / stuck": "On Hold",
        "m. projects on hold": "On Hold",
    }

    @classmethod
    def normalize_text(cls, value: Any) -> Optional[str]:
        if pd.isna(value) or value is None:
            return None
        val_str = str(value).strip()
        return val_str if val_str else None

    @classmethod
    def normalize_sector(cls, value: Any) -> str:
        text = cls.normalize_text(value)
        if not text:
            return "Unassigned / Missing"
        key = text.lower()
        for pattern, canonical in cls.SECTOR_TAXONOMY.items():
            if pattern in key:
                return canonical
        return text.title()

    @classmethod
    def normalize_status(cls, value: Any) -> str:
        text = cls.normalize_text(value)
        if not text:
            return "Unknown"
        key = text.lower()
        return cls.STATUS_TAXONOMY.get(key, text.title())

    @classmethod
    def clean_currency(cls, value: Any) -> float:
        if pd.isna(value) or value is None:
            return 0.0
        val_str = re.sub(r"[₹,$\s]", "", str(value))
        try:
            return float(val_str)
        except Exception:
            return 0.0

    @classmethod
    def clean_date(cls, value: Any) -> Optional[str]:
        if pd.isna(value) or value is None:
            return None
        try:
            dt = pd.to_datetime(value, errors="coerce")
            if pd.isna(dt):
                return None
            return dt.strftime("%Y-%m-%d")
        except Exception:
            return None

    @classmethod
    def normalize_client_name(cls, value: Any) -> str:
        """Standardizes client code or name for cross-board joining."""
        text = cls.normalize_text(value)
        if not text:
            return "UNKNOWN_CLIENT"
        return text.upper().replace(" ", "")