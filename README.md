<div align="center">

<br/>

<img src="https://img.shields.io/badge/Skylark-BI%20Copilot-6366F1?style=for-the-badge&logo=lightning&logoColor=white" alt="Skylark BI Copilot" height="38"/>

# Skylark BI Copilot

### Enterprise AI Command Center for Monday.com CRM

*Ask your business data anything — in plain English.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)
[![Monday.com](https://img.shields.io/badge/Monday.com-GraphQL-FF3D57?style=flat-square&logo=monday.com&logoColor=white)](https://monday.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](./LICENSE)

<br/>

[**Architecture**](#architecture) &nbsp;·&nbsp; [**Quick Start**](#quick-start) &nbsp;·&nbsp; [**API Reference**](#api-reference) &nbsp;·&nbsp; [**Deploy**](#deployment)

<br/>

</div>

---

## What Is This?

Skylark BI Copilot is an **AI-powered Business Intelligence platform** that plugs directly into your Monday.com CRM — no data warehouse, no SQL, no dashboards to learn.

Management asks a question in plain English. Google Gemini AI selects the right analytical tool, queries live Monday.com board data, and returns a structured executive answer with KPIs, source attribution, and intelligent follow-up suggestions.

```
User: "How is our energy sector pipeline performing this quarter?"

→ Gemini selects: sector_analysis
→ Queries:        Deal Funnel board (345 live records)
→ Returns:        Weighted pipeline value · Top accounts · Risk flags · 3 follow-ups
→ Time:           < 5 seconds
```

---

## Screenshots

### Login Page

![Login Page](./docs/screenshots/login.png)

### Dashboard — Light Mode

![Dashboard Light Mode](./docs/screenshots/dashboard_light.png)

### Dashboard — Dark Mode

![Dashboard Dark Mode](./docs/screenshots/dashboard_dark.png)

---

## Feature Overview

| Feature | Description |
|---|---|
| 🤖 **AI Chat Console** | Natural language queries powered by Gemini 2.0 Flash with dynamic Tool Planner routing |
| 📊 **Executive Dashboard** | KPI cards, revenue trends, sector breakdown, deal funnel, sales leaderboard, deal aging |
| 📈 **Revenue Forecast** | 3-month forward projection with confidence ratings and historical trend overlay |
| 🔗 **Cross-Board Analysis** | Joins Deal Funnel clients with Work Order execution value automatically |
| 🛡️ **Data Quality Audit** | Field completeness per board with prioritised recommendations |
| 🌓 **Dark / Light Theme** | One-click toggle via CSS variable token system — no flash, no layout shift |
| 🔐 **JWT Authentication** | Login → signed token → protected API routes |
| 📥 **CSV Export** | One-click download of deals pipeline and work orders |
| 💬 **Conversation Memory** | Session-scoped context so follow-up questions work naturally |
| 🧪 **Type-Safe & Tested** | Zod runtime validation at API boundaries + Vitest unit tests |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 Frontend                     │
│                                                             │
│   /login            /                (analytics tabs)       │
│   JWT Auth     AI Chat Console    Overview│Forecast│Quality  │
└──────────────────────┬──────────────────────────────────────┘
                       │  REST + JWT Bearer
┌──────────────────────▼──────────────────────────────────────┐
│                     FastAPI Backend                         │
│                                                             │
│  POST /chat            →  AI Tool Planner (Gemini routing)  │
│  GET  /api/dashboard/* →  Analytics Services               │
│  POST /api/auth/*      →  JWT Auth                         │
│  GET  /api/reports/*   →  Export + Executive Summaries     │
└──────┬───────────────────────────────────────────────────── ┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│                     Service Layer                           │
│                                                             │
│  GeminiService      →  google-genai SDK                    │
│  InsightEngine      →  Risk + opportunity analysis         │
│  AnalyticsService   →  Aggregations + KPI calculations     │
│  CrossBoardAnalytics → Deal-to-WorkOrder normalization     │
│  ConversationMemory  → Session-scoped chat history         │
└──────┬──────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│                  MondayRepository                           │
│              Monday.com GraphQL API                         │
│                                                             │
│   Board 5030219244 · Deal Funnel        (345 records)       │
│   Board 5030219254 · Work Order Tracker (177 records)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 16 + TypeScript | App Router, SSR-capable, compile-time type enforcement |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first + design tokens for seamless dark/light theme switching |
| **Charts** | Recharts | Composable React-native charts; no external canvas runtime |
| **Validation** | Zod | Runtime schema validation — TypeScript types are erased at runtime, Zod catches real API shape mismatches |
| **Backend** | FastAPI + Uvicorn | Async Python, automatic Swagger UI, Pydantic model validation |
| **AI** | Google Gemini 2.0 Flash | Best cost-to-quality ratio for structured business query routing |
| **Data Source** | Monday.com GraphQL API | Live CRM as source of truth — no separate data warehouse needed |
| **Auth** | JWT (PyJWT) | Stateless — no session store, horizontally scalable |
| **Deployment** | Docker + Compose | Dev/prod parity, one-command startup |
| **CI/CD** | GitHub Actions | Automated build, lint, and type-check on every push |

---

## Project Structure

```
skylark-bi-copilot/
│
├── backend/
│   ├── app/
│   │   ├── api/                    # Route handlers: chat, dashboard, auth, reports
│   │   ├── repositories/           # Monday.com data access — GraphQL queries
│   │   ├── services/               # Business logic
│   │   │   ├── gemini_service.py   # Gemini AI client + prompt management
│   │   │   ├── analytics.py        # KPI + sector + stage calculations
│   │   │   ├── insight_engine.py   # Automated risk/opportunity generation
│   │   │   ├── cross_board_analytics.py  # Deal ↔ Work Order join logic
│   │   │   └── conversation_memory.py    # Session-scoped chat history
│   │   ├── schemas/                # Pydantic request/response models
│   │   ├── constants/              # Board IDs, column mappings, thresholds
│   │   └── main.py                 # App entry point + CORS + middleware
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Main page: AI Console + Analytics Dashboard
│   │   ├── login/page.tsx          # Authentication page
│   │   └── globals.css             # Design system — light + dark CSS tokens
│   ├── components/
│   │   ├── KpiCards.tsx            # Executive KPI metric cards
│   │   └── Charts.tsx              # Full Recharts visualisation suite
│   ├── hooks/
│   │   ├── useDashboard.ts         # Data fetching + error/loading states
│   │   └── useChat.ts              # Conversation state + API calls
│   ├── lib/
│   │   ├── api.ts                  # Service layer (swap backends in one file)
│   │   ├── types.ts                # Zod schemas + inferred TypeScript types
│   │   ├── utils.ts                # Pure utility functions (formatting, math)
│   │   └── constants.ts            # Board IDs, palette, thresholds, prompts
│   └── __tests__/
│       └── utils.test.ts           # Vitest unit tests
│
├── docs/screenshots/               # App screenshots for README
├── docker-compose.yml              # One-command local stack
├── .github/workflows/ci-cd.yml     # CI/CD pipeline
└── README.md
```

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 18 &nbsp;·&nbsp; **Python** ≥ 3.11 &nbsp;·&nbsp; **Docker** *(optional)*

### 1 — Clone

```bash
git clone https://github.com/VedantVH/skylark-bi-copilot.git
cd skylark-bi-copilot
```

### 2 — Backend

```bash
cd backend
cp .env.example .env                        # Fill in your API keys

python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000   # → http://localhost:8000
```

### 3 — Frontend

```bash
cd frontend
cp .env.example .env.local                  # NEXT_PUBLIC_API_URL=http://localhost:8000

npm install
npm run dev                                 # → http://localhost:3000
```

### Docker (one command)

```bash
cp backend/.env.example backend/.env        # Fill in your API keys
docker-compose up --build
```

> **Demo credentials** → `executive@skylark.com` / `skylark2026`  
> Or append `?mock_auth=true` to any URL to skip login in development.

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
| `POST` | `/chat` | AI conversational query with Gemini tool routing |
| `POST` | `/api/auth/login` | Authenticate and receive a signed JWT |
| `GET` | `/api/auth/me` | Return current user from JWT |
| `GET` | `/api/dashboard/summary` | Full dashboard data bundle |
| `GET` | `/api/dashboard/kpi` | KPI metrics |
| `GET` | `/api/dashboard/forecast` | 3-month revenue projection |
| `GET` | `/api/dashboard/cross-board` | Deal → Work Order join analysis |
| `GET` | `/api/dashboard/data-quality` | Field completeness report |
| `GET` | `/api/reports/executive-summary` | AI-written leadership briefing |
| `GET` | `/api/reports/export-csv` | Deal pipeline CSV download |
| `GET` | `/api/reports/export-workorders-csv` | Work orders CSV download |

📖 **Interactive Swagger UI:** `http://localhost:8000/docs`

---

## Testing

```bash
# Frontend — unit tests + type check
cd frontend
npm run test          # Vitest unit tests
npm run build         # TypeScript + production build validation
```

---

## Deployment

### Option A — Vercel + Railway *(free, 5 minutes)*

**Frontend → [Vercel](https://vercel.com)**
1. New Project → Import `VedantVH/skylark-bi-copilot`
2. Root Directory: `frontend`
3. Environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`
4. Deploy

**Backend → [Railway](https://railway.app)**
1. New Project → Deploy from GitHub → Root Directory: `backend`
2. Add all variables from `backend/.env.example`
3. Deploy — Railway auto-detects `requirements.txt`

### Option B — Docker on AWS EC2 / DigitalOcean

```bash
git clone https://github.com/VedantVH/skylark-bi-copilot.git
cd skylark-bi-copilot
cp backend/.env.example backend/.env        # Add real keys
docker-compose up -d --build
# Frontend → http://YOUR_IP:3000
# Backend  → http://YOUR_IP:8000
```

---

## Design Decisions

**Why Gemini over GPT-4?**  
Gemini 2.0 Flash offers comparable quality at lower cost and latency. The `google-genai` SDK's tool-calling API mapped cleanly onto the custom Tool Registry without extra adapter layers.

**Why not Metabase or Looker?**  
Those tools require a SQL data warehouse. Monday.com GraphQL is the source of truth here — a conversational interface removes the need for non-technical users to learn query languages or BI tools.

**Why Zod alongside TypeScript types?**  
TypeScript types are erased at runtime. Monday.com's GraphQL responses have inconsistent field presence depending on board configuration. Zod catches actual shape mismatches before they silently produce `NaN` in charts.

**Why `useDashboard` and `useChat` hooks?**  
Without extraction, `page.tsx` would exceed 600 lines of interleaved fetching, state, and JSX. Custom hooks make the data layer independently testable and keep components purely presentational.

---

## Roadmap

- [ ] Redis caching for <200ms dashboard responses
- [ ] OAuth2 / SSO for production-grade authentication
- [ ] Persistent chat history with PostgreSQL session store
- [ ] PDF / PowerPoint executive report export
- [ ] Scheduled weekly email digest
- [ ] Multi-workspace Monday.com support
- [ ] Slack / Microsoft Teams notification integration

---

## License

MIT © 2026 [Vedant Honnangi](https://github.com/VedantVH) — Skylark Drones

---

<div align="center">

Built with &nbsp;**FastAPI** · **Next.js** · **Google Gemini** · **Monday.com**

⭐ If this project helped you, please give it a star!

</div>
