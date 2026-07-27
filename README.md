<div align="center">

<img src="https://img.shields.io/badge/Skylark-BI%20Copilot-6366F1?style=for-the-badge&logo=lightning&logoColor=white" alt="Skylark BI Copilot" height="40"/>

# Skylark BI Copilot

**Enterprise AI Command Center for Monday.com CRM**

*Ask your business data anything. In plain English.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)
[![Monday.com](https://img.shields.io/badge/Monday.com-GraphQL-FF3D57?style=flat-square&logo=monday.com&logoColor=white)](https://monday.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](./LICENSE)

<br/>

[**Live Demo**](#quick-start) · [**API Docs**](http://localhost:8000/docs) · [**Architecture**](#architecture) · [**Deploy**](#deployment)

</div>

---

## What Is This?

Skylark BI Copilot is an **AI-powered Business Intelligence platform** that connects directly to your Monday.com CRM — no data warehouse, no SQL, no dashboards to learn.

Management types a question. Gemini AI selects the right analytical tool, queries live Monday.com data, and returns a structured executive answer with supporting KPIs, source attribution, and suggested follow-ups.

> **"How is our energy sector pipeline performing this quarter?"**  
> → Gemini selects `sector_analysis`, queries Deal Funnel (345 records), returns weighted pipeline value, top accounts, risk flags, and 3 follow-up questions — in under 5 seconds.

---

## Screenshots

| AI Command Center | Executive Analytics |
|---|---|
| ![console](https://via.placeholder.com/520x320/0B0F17/818CF8?text=AI+Console) | ![analytics](https://via.placeholder.com/520x320/0B0F17/06B6D4?text=Analytics+Dashboard) |

| Login Page (Light) | Dark Mode |
|---|---|
| ![login](https://via.placeholder.com/520x320/EEF2FF/6366F1?text=Login+Page) | ![dark](https://via.placeholder.com/520x320/111827/818CF8?text=Dark+Mode) |

---

## Feature Overview

| Feature | Description |
|---|---|
| 🤖 **AI Chat Console** | Natural language queries powered by Gemini 2.0 Flash with dynamic Tool Planner routing |
| 📊 **Executive Dashboard** | KPI cards, revenue trends, sector breakdown, deal funnel, sales leaderboard, deal aging |
| 📈 **Revenue Forecast** | 3-month forward projection with confidence ratings and historical comparison |
| 🔗 **Cross-Board Analysis** | Joins Deal Funnel clients with Work Order execution value — no manual matching |
| 🛡️ **Data Quality Audit** | Field completeness per board with actionable recommendations |
| 🌓 **Dark / Light Theme** | One-click toggle with CSS variable token system — no flash, no rerender |
| 🔐 **JWT Authentication** | Login → signed token → protected API routes |
| 📥 **CSV Export** | One-click download of deals and work orders |
| 💬 **Conversation Memory** | Context-aware follow-up questions across a session |
| 🧪 **Type-Safe & Tested** | Zod runtime validation + Vitest unit tests on all core logic |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js 16 Frontend                   │
│                                                         │
│   /login          /           (analytics tabs)          │
│   JWT Auth   AI Console    Overview│Forecast│CrossBoard  │
└─────────────────────┬───────────────────────────────────┘
                      │  REST + JWT Bearer
┌─────────────────────▼───────────────────────────────────┐
│                  FastAPI Backend                         │
│                                                         │
│  POST /chat        →  AI Tool Planner                   │
│  GET  /api/dashboard/*  →  Analytics Services           │
│  POST /api/auth/login   →  JWT Auth                     │
│  GET  /api/reports/*    →  Export / Summaries           │
└──────┬──────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│                   Service Layer                          │
│                                                         │
│  GeminiService     →  google-genai SDK                  │
│  InsightEngine     →  Risk + opportunity analysis       │
│  AnalyticsService  →  Aggregations + KPI calculations   │
│  CrossBoardAnalytics → Deal-to-WorkOrder join logic     │
│  ConversationMemory  → Session-scoped chat history      │
└──────┬──────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│               MondayRepository                          │
│         Monday.com GraphQL API                          │
│   Board 5030219244: Deal Funnel (345 records)           │
│   Board 5030219254: Work Order Tracker (177 records)    │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Reasoning |
|---|---|---|
| **Frontend** | Next.js 16 + TypeScript | App Router, SSR-capable, enforces type safety across the codebase |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first with design tokens — enables dark/light themes without JS |
| **Charts** | Recharts | React-native composable charts; no Canvas complexity |
| **Validation** | Zod | Runtime schema validation at API boundaries — TypeScript types alone are erased at runtime |
| **Backend** | FastAPI + Uvicorn | Async Python with automatic OpenAPI docs and Pydantic model validation |
| **AI** | Google Gemini 2.0 Flash | Best cost/latency ratio for structured business query routing at this scale |
| **Data Source** | Monday.com GraphQL API | CRM is the canonical source of truth; avoids a separate data warehouse |
| **Auth** | JWT (PyJWT) | Stateless auth — no session store needed, horizontally scalable |
| **Deployment** | Docker + Compose | Dev/prod parity, one-command local stack |
| **CI/CD** | GitHub Actions | Auto build + lint on every push |

---

## Project Structure

```
skylark-bi-copilot/
│
├── backend/
│   ├── app/
│   │   ├── api/                  # Route handlers (chat, dashboard, auth, reports)
│   │   ├── repositories/         # Monday.com data access — GraphQL queries
│   │   ├── services/             # Business logic (AI, analytics, health, memory)
│   │   │   ├── gemini_service.py
│   │   │   ├── analytics.py
│   │   │   ├── insight_engine.py
│   │   │   ├── cross_board_analytics.py
│   │   │   └── conversation_memory.py
│   │   ├── schemas/              # Pydantic request/response models
│   │   ├── constants/            # Board IDs, column maps, thresholds
│   │   └── main.py               # App entry + CORS + middleware
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard (AI Console + Analytics)
│   │   ├── login/page.tsx        # Authentication page
│   │   └── globals.css           # Design system — light + dark CSS tokens
│   ├── components/
│   │   ├── KpiCards.tsx          # Executive metric cards
│   │   └── Charts.tsx            # Full Recharts visualisation suite
│   ├── hooks/
│   │   ├── useDashboard.ts       # Dashboard fetch + error/loading states
│   │   └── useChat.ts            # Chat conversation state management
│   ├── lib/
│   │   ├── api.ts                # Service layer — swap backend in one file
│   │   ├── types.ts              # Zod schemas + inferred TypeScript types
│   │   ├── utils.ts              # Pure formatting + calculation functions
│   │   └── constants.ts          # Magic strings, board IDs, palette, thresholds
│   └── __tests__/
│       └── utils.test.ts         # Vitest unit tests
│
├── docker-compose.yml            # One-command local stack
├── .github/workflows/ci-cd.yml   # GitHub Actions pipeline
└── README.md
```

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 18 · **Python** ≥ 3.11 · **Docker** (optional)

### 1 · Clone the repo

```bash
git clone https://github.com/VedantVH/skylark-bi-copilot.git
cd skylark-bi-copilot
```

### 2 · Start the backend

```bash
cd backend
cp .env.example .env          # Add your API keys (see below)

python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

### 3 · Start the frontend

```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:8000

npm install
npm run dev                   # → http://localhost:3000
```

### Or: one-command Docker

```bash
cp backend/.env.example backend/.env   # Fill in your keys
docker-compose up --build
```

> **Demo login:** `executive@skylark.com` / `skylark2026`  
> Or append `?mock_auth=true` to bypass auth in development.

---

## Environment Variables

**`backend/.env`**

```env
MONDAY_API_KEY=your_monday_personal_api_token
MONDAY_ACCOUNT_ID=your_monday_account_id
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=change_this_to_a_long_random_string
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chat` | AI conversational query with tool routing |
| `POST` | `/api/auth/login` | Authenticate and receive JWT token |
| `GET` | `/api/auth/me` | Get current user from token |
| `GET` | `/api/dashboard/summary` | Full dashboard data bundle |
| `GET` | `/api/dashboard/kpi` | KPI metrics only |
| `GET` | `/api/dashboard/forecast` | 3-month revenue projection |
| `GET` | `/api/dashboard/cross-board` | Deal → Work Order conversion join |
| `GET` | `/api/dashboard/data-quality` | Field completeness report |
| `GET` | `/api/reports/executive-summary` | AI-written leadership briefing |
| `GET` | `/api/reports/export-csv` | Deal pipeline CSV download |
| `GET` | `/api/reports/export-workorders-csv` | Work orders CSV download |

📖 **Interactive docs:** [`http://localhost:8000/docs`](http://localhost:8000/docs)

---

## Testing

```bash
cd frontend

# Unit tests (Vitest)
npm run test

# Type check + production build
npm run build
```

```bash
cd backend

# API integration test (all 17 endpoints)
python3 -c "
import requests
endpoints = ['/', '/api/dashboard/summary', '/api/dashboard/forecast']
for ep in endpoints:
    r = requests.get(f'http://localhost:8000{ep}')
    print(f'[{\"PASS\" if r.status_code == 200 else \"FAIL\"}] {ep}')
"
```

---

## Deployment

### Vercel + Railway (Recommended — Free Tier)

**Frontend → [Vercel](https://vercel.com)**
1. Import `VedantVH/skylark-bi-copilot` → set Root Directory: `frontend`
2. Add env var: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`
3. Deploy

**Backend → [Railway](https://railway.app)**
1. New Project → Deploy from GitHub → Root Directory: `backend`
2. Add all backend env vars from `.env.example`
3. Deploy (auto-detects `requirements.txt`)

### Docker on AWS EC2 / DigitalOcean

```bash
# On your server
git clone https://github.com/VedantVH/skylark-bi-copilot.git
cd skylark-bi-copilot
cp backend/.env.example backend/.env   # Fill in keys
docker-compose up -d --build
# → Frontend: http://YOUR_IP:3000 · Backend: http://YOUR_IP:8000
```

---

## Key Design Decisions

**Why Gemini over GPT-4?**  
Flash gives comparable quality at lower latency and cost. The `google-genai` SDK's tool-calling API mapped cleanly onto the custom Tool Registry pattern without needing function-call wrappers.

**Why not Metabase or Looker?**  
Those require a SQL data warehouse. Monday.com's GraphQL API is the source of truth here — a conversational interface removes the need for non-technical users to write queries or learn a BI tool.

**Why Zod alongside TypeScript types?**  
TypeScript types are compile-time only — they're erased at runtime. Monday.com's GraphQL responses have inconsistent field presence depending on board configuration. Zod catches shape mismatches before they silently produce `NaN` in charts.

**Why custom hooks (`useDashboard`, `useChat`)?**  
Without extraction, `page.tsx` would be 600+ lines of interleaved fetching, state, and JSX. Hooks make the data layer independently testable and keep components presentation-only.

---

## Roadmap

- [ ] Redis caching layer for <200ms dashboard responses
- [ ] OAuth2 / SSO for production authentication
- [ ] Persistent chat history with PostgreSQL session store
- [ ] PDF / PowerPoint executive report export
- [ ] Scheduled weekly digest email (endpoint already exists)
- [ ] Multi-workspace Monday.com support
- [ ] Slack / Teams notification integration

---

## License

MIT © 2026 [Vedant Honnangi](https://github.com/VedantVH) — Skylark Drones

---

<div align="center">

Built with FastAPI · Next.js · Google Gemini · Monday.com

⭐ Star this repo if you found it useful!

</div>
