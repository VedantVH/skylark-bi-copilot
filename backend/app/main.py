from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging

from app.api.routes import router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S"
)
logger = logging.getLogger("skylark_bi")

app = FastAPI(
    title="Skylark BI Copilot",
    description="""
## Skylark BI Copilot — Enterprise AI Business Intelligence Platform

An AI-powered BI platform that connects to **Monday.com CRM** to answer natural language business questions,
generate executive dashboards, and produce board-level intelligence reports.

### Key Capabilities
- **Live Monday.com Integration** — GraphQL API queries across Deal Funnel & Work Order Tracker
- **AI Tool Planner** — Google Gemini selects and executes the right analytical tool per question
- **Conversational Memory** — Multi-turn context-aware dialogue
- **Advanced Analytics** — Pipeline metrics, sector analysis, deal aging, salesperson leaderboards
- **Executive Reports** — Board-level briefings with KPIs, risks, and strategic recommendations
- **Data Normalization** — Automatic sector taxonomy mapping, date coercion, quality scoring
- **Cross-Board Analytics** — Deals → Work Order conversion funnel tracking

### Boards
- `5030219244` — Deal Funnel (345 active deals)
- `5030219254` — Work Order Tracker (177 projects)
    """,
    version="2.0.0",
    contact={
        "name": "Skylark Drones — Engineering",
        "email": "engineering@skylarkdrones.com",
    },
    license_info={
        "name": "Proprietary",
    },
    openapi_tags=[
        {"name": "Chat",        "description": "Conversational AI endpoint with tool planning"},
        {"name": "Dashboard",   "description": "KPI, pipeline, sectors, trends, health dashboard"},
        {"name": "Reports",     "description": "Executive reports and CSV exports"},
        {"name": "Auth",        "description": "JWT authentication"},
        {"name": "Monday",      "description": "Raw Monday.com board access"},
        {"name": "Analytics",   "description": "Legacy analytics endpoints"},
    ]
)

# CORS — allow all origins for hosted demo (using Bearer tokens, credentials false for wildcard support)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
    elapsed_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Response-Time-Ms"] = f"{elapsed_ms:.1f}"
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({elapsed_ms:.1f}ms)")
    return response


app.include_router(router)