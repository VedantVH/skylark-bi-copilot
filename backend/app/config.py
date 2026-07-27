from dotenv import load_dotenv
import os

load_dotenv()

MONDAY_API_KEY = os.getenv("MONDAY_API_KEY")

MONDAY_API_URL = os.getenv(
    "MONDAY_API_URL",
    "https://api.monday.com/v2"
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")