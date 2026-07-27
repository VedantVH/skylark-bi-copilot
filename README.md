# Skylark BI Copilot

**An AI-powered Business Intelligence platform** that connects live to Monday.com CRM, answers natural language business questions via Google Gemini AI, and provides executive dashboards with real-time deal pipeline + work order analytics.

> Built as an enterprise-grade AI copilot so management can interact with business data conversationally — replacing static dashboards with a live, intelligent command center.

---

## Live Demo

| Surface | URL |
|---|---|
| Frontend (AI Command Center) | `http://localhost:3000` |
| Backend API (FastAPI) | `http://localhost:8000` |
| Interactive API Docs (Swagger) | `http://localhost:8000/docs` |

---

## Architecture

```
┌─────────────────────────────────────┐
│         Next.js Frontend            │
│  AI Console │ Analytics Dashboard   │
└──────────────┬──────────────────────┘
               │ HTTP + JWT
┌──────────────▼──────────────────────┐
│         FastAPI Backend             │
│                                     │
│  /chat   ─► AI Tool Planner         │
│  /api/dashboard  ─► Analytics       │
│  /api/auth       ─► JWT Auth        │
│  /api/reports    ─► Export/Summary  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Service Layer               │
│                                     │
│  GeminiService  ─► google-genai     │
│  InsightEngine  ─► Trend analysis   │
│  AnalyticsService ─► Aggregations   │
│  CrossBoardAnalytics ─► Join logic  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       MondayRepository              │
│   GraphQL API → Monday.com CRM      │
│   Deal Funnel + Work Order Tracker  │
└─────────────────────────────────────┘
```

---

## Tech Stack & Reasoning

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 16 + TypeScript | App Router, SSR-ready, strong typing |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first + design tokens for dark/light theme |
| **Charts** | Recharts | Composable, React-native, no canvas complexity |
| **Validation** | Zod | Runtime schema validation at API boundaries — no silent failures |
| **Backend** | FastAPI + Uvicorn | Async Python, automatic OpenAPI docs, Pydantic models |
| **AI** | Google Gemini 2.0 Flash | Cost-effective, fast, supports tool calling and long context |
| **Data Source** | Monday.com GraphQL API | Live CRM data — deals, work orders, pipelines |
| **Auth** | JWT (PyJWT) | Stateless, simple to deploy, no session store needed |
| **Deployment** | Docker + Docker Compose | One-command local + production parity |
| **CI/CD** | GitHub Actions | Auto-build + lint on PR |

---

## Folder Structure

```
skylark-drones/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI route handlers
│   │   ├── repositories/     # Monday.com data access layer
│   │   ├── services/         # Business logic (analytics, AI, health)
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── config.py         # Environment configuration
│   │   └── main.py           # App entry point + middleware
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Main dashboard (AI console + analytics)
│   │   ├── login/page.tsx    # Authentication page
│   │   └── globals.css       # Design system (light + dark tokens)
│   ├── components/           # Reusable UI components
│   │   ├── KpiCards.tsx      # Executive KPI metric cards
│   │   └── Charts.tsx        # Recharts visualisation suite
│   ├── hooks/                # Custom React hooks
│   │   ├── useDashboard.ts   # Dashboard data fetching + error states
│   │   └── useChat.ts        # Chat conversation state management
│   ├── lib/                  # Core utilities
│   │   ├── api.ts            # API service layer (one file to swap backends)
│   │   ├── types.ts          # Zod schemas + TypeScript types
│   │   ├── utils.ts          # Pure utility functions (formatting, calcs)
│   │   └── constants.ts      # App-wide magic strings/numbers
│   └── __tests__/            # Unit tests (Vitest)
│
├── docker-compose.yml        # One-command local dev stack
├── .github/workflows/        # CI/CD pipelines
└── README.md
```

---

## Quick Start (Local)

### Prerequisites
- Node.js ≥ 18, Python ≥ 3.11, Docker (optional)

### 1. Clone
```bash
git clone https://github.com/YOUR_USERNAME/skylark-bi-copilot.git
cd skylark-bi-copilot
```

### 2. Backend
```bash
cd backend
cp .env.example .env          # Fill in MONDAY_API_KEY, GEMINI_API_KEY, JWT_SECRET
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local    # Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                   # Starts on http://localhost:3000
```

### Or: One-command Docker
```bash
docker-compose up --build
```

---

## Demo Credentials
```
Email:    executive@skylark.com
Password: skylark2026
```
Or append `?mock_auth=true` to any URL to skip login in dev.

---

## Key Features

- **AI Chat Console** — Natural language queries answered by Gemini AI with tool selection, source attribution, and follow-up suggestions
- **Executive Analytics** — KPI cards, revenue trends, sector breakdown, deal stage funnel, sales leaderboard, deal aging
- **Revenue Forecast** — 3-month forward projection with confidence ratings
- **Cross-Board Conversion** — Matches Deal Funnel clients to Work Order execution value
- **Data Quality Audit** — Field completeness per board with recommendations
- **Dark / Light Theme** — Toggle in header; persists via CSS variable design tokens
- **JWT Authentication** — Login → token → protected routes
- **CSV Export** — One-click download of deals and work orders

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | AI conversational query |
| POST | `/api/auth/login` | JWT authentication |
| GET | `/api/dashboard/summary` | Full dashboard bundle |
| GET | `/api/dashboard/forecast` | 3-month revenue projection |
| GET | `/api/dashboard/cross-board` | Deal → Work Order join |
| GET | `/api/dashboard/data-quality` | Data completeness report |
| GET | `/api/reports/executive-summary` | AI-written leadership memo |
| GET | `/api/reports/export-csv` | Pipeline CSV download |

Full interactive docs: `http://localhost:8000/docs`

---

## Testing

```bash
cd frontend
npm run test          # Vitest unit tests
npm run build         # TypeScript + build validation
```

---

## Deployment (AWS EC2)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full AWS + Nginx + HTTPS setup.

**Quick production build:**
```bash
docker-compose -f docker-compose.yml up -d --build
```

---

## Known Limitations & Future Work

- [ ] Monday.com data is fetched on-demand — add Redis caching for <200ms responses
- [ ] Auth is demo-level — add OAuth2 / SSO for production
- [ ] No persistent chat history — add PostgreSQL session store
- [ ] PDF/PowerPoint export pipeline (endpoint exists, frontend button pending)
- [ ] Scheduled weekly digest email (backend route exists: `/api/reports/weekly-summary`)
- [ ] Multi-workspace Monday.com support

---

## Architecture Decisions

**Why Gemini over GPT-4?**  
Google Gemini Flash offers comparable quality at lower cost and latency for structured business query routing. The `google-genai` SDK's tool-calling API mapped cleanly to the custom Tool Registry pattern.

**Why not a traditional dashboard (Metabase/Looker)?**  
Those tools require SQL/data warehouse setup. Monday.com's GraphQL API is the source of truth here, and a conversational interface removes the need for business users to learn query languages.

**Why Zod over just TypeScript types?**  
TypeScript types are erased at runtime. Zod validates the actual JSON from Monday.com's API, which has inconsistent field presence. This catches shape mismatches before they silently produce NaN in charts.

---

## License

MIT © 2026 Skylark Drones
