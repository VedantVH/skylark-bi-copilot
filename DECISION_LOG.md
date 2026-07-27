# Decision Log — Skylark Drones BI Agent Technical Assignment

**Author:** Vedant Honnangi  
**Date:** July 2026  
**Submission:** Skylark BI Copilot — Enterprise AI Business Intelligence Agent

---

## 1. Key Assumptions Made

**Monday.com Data Import & Board Setup:**  
The two Excel files were imported into Monday.com as two separate boards: **Deal Funnel** (ID: `5030219244`) and **Work Order Tracker** (ID: `5030219254`). Column types were configured explicitly: Status columns as status/dropdown, Date columns as date, and Masked Deal/Billed Values as numbers. All column names in the local fallback datasets map to the equivalent Monday.com column IDs (e.g. `Masked Deal value` → `numeric_mm5nvwfz`). Live Monday.com GraphQL API calls are made first; if the API is unavailable or returns no data, the system automatically falls back to local datasets to ensure 100% uptime.

**Data Masking & Currency:**  
The masked data (client codes like `COMPANY089`, owner codes like `OWNER_001`) are treated as production data. All financial amounts are in Indian Rupees (₹).

**Taxonomy & Normalization Rules:**  
- **Sectors:** Standardized via explicit mapping dict (`DataCleaner.SECTOR_TAXONOMY`) mapping variants like "powerline", "power", "solar" → "Energy & Power", "mining" → "Mining & Resources", etc.
- **Statuses:** Normalized to standard states ("Completed", "In Progress", "Not Started", "On Hold").
- **Dates:** Coerced into ISO-8601 `YYYY-MM-DD`. Missing dates are excluded from time-series aggregations but preserved in total count/value metrics, accompanied by explicit caveats.
- **Cross-Board Join Key:** Deals and Work Orders are linked on normalized `Client Code` (`DataCleaner.normalize_client_name`).

---

## 2. Technical Architecture & Trade-Offs

### Why FastAPI + Python?
Python's Pandas ecosystem handles null coercion, date normalization, taxonomy mapping, and cross-board groupby joins in a clean service layer. FastAPI provides zero-overhead async REST APIs with automatic OpenAPI/Swagger documentation.

### Why Gemini AI Tool Planner (not pure hardcoded keyword matching)?
A Gemini-powered Tool Planner dynamically interprets user intent and selects from 12 specialized analytics tools (`pipeline`, `work_orders`, `cross_board`, `data_quality`, `sectors`, `health`, etc.). A keyword-fallback layer ensures resilience if the LLM API is unavailable.

### Why Next.js 16 App Router?
Next.js provides SSR/CSR hybrid rendering, clean Vercel deployment, and a responsive component model for the dashboard + chat drawer architecture. React 19 with Recharts delivers interactive BI visualizations.

### Key Trade-offs:
| Decision | Trade-off |
|---|---|
| Single `/api/dashboard/summary` endpoint for full bundle | Higher initial payload vs. zero frontend cascade rendering |
| Excel fallback alongside live API | Requires `openpyxl` dependency but guarantees 100% submission availability |
| In-memory conversation memory | Simple multi-turn memory without external DB overhead |
| Client Code matching for cross-board join | Handles missing explicit Deal IDs across boards gracefully |

---

## 3. Interpretation of "Leadership Updates"

**"The agent should help prepare data for leadership updates."**

I implemented this through three complementary capabilities:

**A. Board-Level Executive Briefing Generator (`/api/reports/executive-summary`)**  
On-demand synthesis generating a structured board briefing with key revenue metrics, health score, growth insights, critical risks, and 3–5 strategic recommendations.

**B. Data Quality Transparency Panel**  
Surfaces cross-board field completeness scores (e.g. 87.2% overall quality score), explicit caveats, and recommendations for Monday.com data entry discipline.

**C. One-Click CSV Export**  
Direct stream download of the pipeline dataset for presentation preparation and offline analysis.

---

## 4. What I'd Do Differently With More Time

1. **Persistent conversation memory** — Store chat sessions in Redis or SQLite so history survives restarts.
2. **Sector-level interactive drill-down** — Add multi-select sector filtering across all charts.
3. **Scheduled weekly briefings** — Automated Slack or email dispatch of weekly executive summaries.
4. **Voice interface** — Web Speech API integration for spoken queries during leadership meetings.

---

*Total development time: ~6 hours.*
