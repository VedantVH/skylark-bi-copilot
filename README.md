<div align="center">

<br/>

<img src="https://img.shields.io/badge/Skylark-BI%20Copilot-6366F1?style=for-the-badge&logo=lightning&logoColor=white" alt="Skylark BI Copilot" height="42"/>

# 🚀 Skylark BI Copilot

### Enterprise AI Command Center for Monday.com CRM

*Conversational Business Intelligence powered by Google Gemini AI & Live GraphQL Telemetry*

<br/>

[![Live App on Vercel](https://img.shields.io/badge/🚀%20Live%20App-skylark--bi--copilot.vercel.app-6366F1?style=for-the-badge&logo=vercel&logoColor=white)](https://skylark-bi-copilot-trko-two.vercel.app/)

<br/>

[![Frontend on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://skylark-bi-copilot-trko-two.vercel.app/)
[![Backend on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)
[![Monday.com](https://img.shields.io/badge/Monday.com-GraphQL-FF3D57?style=flat-square&logo=monday.com&logoColor=white)](https://monday.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](./LICENSE)

<br/>

[**🌐 Live Application**](https://skylark-bi-copilot-trko-two.vercel.app/) &nbsp;·&nbsp; [**🏗️ Architecture**](#architecture) &nbsp;·&nbsp; [**⚡ Quick Start**](#quick-start) &nbsp;·&nbsp; [**📖 API Docs**](#api-reference) &nbsp;·&nbsp; [**☁️ Deployment Status**](#deployment-status)

<br/>

</div>

---

## 🌐 Production Deployment Status

The application is fully deployed and accessible live:

| Tier | Service | URL / Platform | Status |
|---|---|---|---|
| 🎨 **Frontend** | Next.js 16 (Turbopack + Tailwind) | [**https://skylark-bi-copilot-trko-two.vercel.app**](https://skylark-bi-copilot-trko-two.vercel.app/) *(Hosted on Vercel)* | ![Vercel Status](https://img.shields.io/badge/Vercel-Online-22C55E?style=flat-square&logo=vercel) |
| ⚙️ **Backend** | FastAPI + Python 3.11 | **Render Cloud Platform** *(Automatic CORS & JWT Auth)* | ![Render Status](https://img.shields.io/badge/Render-Online-22C55E?style=flat-square&logo=render) |
| 🤖 **AI Engine** | Google Gemini 2.0 Flash | **Google AI Studio** *(Dynamic Tool Routing & Planning)* | ![Gemini Status](https://img.shields.io/badge/Gemini-Active-4285F4?style=flat-square&logo=google) |
| 📊 **Data Integration** | Monday.com GraphQL API | **Live Boards** *(Deal Funnel #5030219244 & Work Orders #5030219254)* | ![Monday Status](https://img.shields.io/badge/Monday.com-Connected-FF3D57?style=flat-square&logo=monday.com) |

> 🔑 **Demo Login Credentials** (Pre-filled on login page):
> - **Email**: `executive@skylark.com`
> - **Password**: `skylark2026`

---

## 💡 What Is Skylark BI Copilot?

Skylark BI Copilot is an **AI-powered Business Intelligence platform** built for executive decision-makers. Instead of manually building complex dashboards or writing SQL queries, managers interact with business data conversationally.

Google Gemini AI functions as an autonomous tool planner: it interprets natural language questions, routes them to live GraphQL analytical services, queries Monday.com CRM telemetry, and synthesizes executive answers with quantitative proof, risk flags, and follow-up recommendations.

```
User Query: "How is our energy sector pipeline performing this quarter?"

┌────────────────────────────────────────────────────────────────────────┐
│  1. Gemini Tool Planner identifies query intent → 'sector_analysis'    │
│  2. MondayRepository fetches 345 deals & 177 work orders live via API   │
│  3. Analytics Engine normalizes sector taxonomy & calculates metrics    │
│  4. Gemini synthesizes weighted pipeline, top accounts & risk flags     │
└────────────────────────────────────────────────────────────────────────┘

Output: Weighted Pipeline: ₹92.22 Cr (40% of total) · Top Client: Tata Power · 3 Actionable Follow-ups (< 4.2s)
```

---

## 📸 Interactive Visual Showcase

<details open>
<summary><b>🔐 Modern Dual-Theme Login Console</b></summary>

![Login Page](./docs/screenshots/login.png)
*Features split hero banner with live record indicators, JWT authentication, and pre-filled demo access.*

</details>

<details open>
<summary><b>☀️ Executive Visual Analytics (Light Mode)</b></summary>

![Dashboard Light Mode](./docs/screenshots/dashboard_light.png)
*Interactive KPI cards, dynamic sector breakdown, stage funnels, sales leaderboards, and revenue forecasting.*

</details>

<details open>
<summary><b>🌙 AI Command Center & Conversational Console (Dark Mode)</b></summary>

![Dashboard Dark Mode](./docs/screenshots/dashboard_dark.png)
*Full glassmorphic AI chat drawer with streaming thinking steps, live source tracing, and interactive prompt chips.*

</details>

---

## ✨ Key Capabilities

| Capability | Technical Implementation |
|---|---|
| 🤖 **Autonomous AI Tool Planner** | Uses Gemini 2.0 Flash function routing to map natural language to specific GraphQL analytical tools |
| 📊 **Real-time Executive Dashboard** | Live KPI summary cards, revenue trends, stage funnel, sales leaderboard, deal aging matrix |
| 📈 **Predictive Revenue Forecast** | 3-month forward-looking probability matrix with confidence ratings & historical overlay |
| 🔗 **Cross-Board Conversion Join** | Automatically joins Deal Funnel items with Work Order execution contracts without manual keying |
| 🛡️ **Automated Data Quality Audit** | Field completeness scoring per Monday.com board with automated quality recommendations |
| 🌓 **Adaptive Dual-Theme System** | Instant Light/Dark toggle with zero layout shift via CSS variable tokens |
| 🔐 **Stateless JWT Security** | Secure token-based authentication protecting endpoints with configurable expiration |
| 📥 **One-Click Telemetry Export** | Instant CSV streaming endpoints for both pipeline deals and active work orders |
| 💬 **Session-Aware Context** | Multi-turn conversation memory allowing contextual follow-up questions |
| 🧪 **Enterprise Type Safety** | 100% Zod schema validation at API bounds + Vitest unit test coverage for calculation logic |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 Frontend                              │
│                      (Hosted live on Vercel)                            │
│                                                                         │
│   /login               /                      (Analytics Tabs)          │
│   Auth Console    AI Chat Drawer      Overview │ Forecast │ Quality     │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │  HTTPS + JWT Bearer Auth
┌───────────────────────────▼─────────────────────────────────────────────┐
│                        FastAPI Backend                                  │
│                       (Hosted on Render)                                │
│                                                                         │
│  POST /chat            →  AI Tool Planner (Gemini SDK)                  │
│  GET  /api/dashboard/* →  Analytics & Health Engine                     │
│  POST /api/auth/*      →  JWT Token Issuer                              │
│  GET  /api/reports/*   →  Executive Summaries & CSV Exporters           │
└────────────┬────────────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────────────┐
│                        Service Orchestration                            │
│                                                                         │
│  GeminiService      →  Google Gemini 2.0 Flash Client                 │
│  InsightEngine      →  Automated Risk & Opportunity Matrix              │
│  AnalyticsService   →  Pipeline Aggregations & Distribution Math        │
│  CrossBoardAnalytics → Deal-to-WorkOrder Matching Engine                │
│  ConversationMemory  → Session-Scoped Context Manager                   │
└────────────┬────────────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────────────────┐
│                       Monday.com Repository                             │
│                      GraphQL API Integration                            │
│                                                                         │
│   Board #5030219244 · Deal Funnel        (345 live items)               │
│   Board #5030219254 · Work Order Tracker (177 active projects)          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack & Selection Rationale

| Layer | Technology | Selection Rationale |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (App Router)** | Modern Turbopack compiler, optimized client bundle sizing, server-ready routing. |
| **Styling & UI** | **Tailwind CSS + CSS Tokens** | Utility-first styling paired with native CSS variables for dark/light themes with zero JS overhead. |
| **Data Visualization** | **Recharts** | Declarative React charting engine with smooth SVG animation and responsive containers. |
| **Schema Validation** | **Zod** | Enforces runtime type safety at external boundary points where TypeScript compile types are erased. |
| **Backend Framework** | **FastAPI (Python 3.11/3.12)** | Asynchronous execution, automatic OpenAPI Swagger documentation, high throughput. |
| **AI Language Model** | **Google Gemini 2.0 Flash** | Sub-second latency, structured function calling, cost-effective context window. |
| **CRM Integration** | **Monday.com GraphQL API** | Canonical business data source queried directly without requiring intermediate database copies. |
| **Authentication** | **PyJWT (JSON Web Tokens)** | Stateless token validation allowing horizontal scaling across backend instances. |
| **Hosting Platform** | **Vercel + Render** | Vercel provides global edge delivery for frontend; Render delivers reliable Python execution. |

---

## 📁 Repository Structure

```
skylark-bi-copilot/
│
├── backend/                        # FastAPI Python Service
│   ├── app/
│   │   ├── api/                    # REST routes: chat, dashboard, auth, reports
│   │   ├── repositories/           # Monday.com GraphQL client & query builders
│   │   ├── services/               # Core business & AI logic
│   │   │   ├── gemini_service.py   # Gemini AI integration & fallback engines
│   │   │   ├── analytics.py        # KPI aggregations & calculation logic
│   │   │   ├── insight_engine.py   # Risk/Opportunity detection algorithms
│   │   │   ├── cross_board_analytics.py # Multi-board client join algorithms
│   │   │   └── conversation_memory.py   # Memory buffer manager
│   │   ├── schemas/                # Pydantic data schemas
│   │   ├── constants/              # Board IDs, column mappings, thresholds
│   │   └── main.py                 # FastAPI application entry & CORS policy
│   ├── .env.example                # Template environment configuration
│   ├── Dockerfile                  # Container definition
│   └── requirements.txt            # Python dependencies
│
├── frontend/                       # Next.js React Client Application
│   ├── app/
│   │   ├── page.tsx                # Main AI Command Center & Dashboard page
│   │   ├── login/page.tsx          # Dual-theme Authentication Console
│   │   └── globals.css             # Unified light/dark theme CSS variables
│   ├── components/
│   │   ├── KpiCards.tsx            # Executive metric cards
│   │   ├── Charts.tsx              # Recharts visual analytics suite
│   │   └── ExecutiveReportModal.tsx# AI briefing overlay modal
│   ├── hooks/
│   │   ├── useDashboard.ts         # Custom hook for analytics telemetry
│   │   └── useChat.ts              # Custom hook for AI chat state & thinking steps
│   ├── lib/
│   │   ├── api.ts                  # Axios API client with automatic mock fallbacks
│   │   ├── types.ts                # Zod schemas & TypeScript type exports
│   │   ├── utils.ts                # Utility functions & class merger (cn)
│   │   └── constants.ts            # Palette, starter prompts, board constants
│   └── __tests__/
│       └── utils.test.ts           # Vitest unit test suite
│
├── docs/screenshots/               # High-res application screenshots
├── docker-compose.yml              # Local multi-container deployment orchestration
└── README.md                       # Documentation
```

---

## ⚡ Quick Start Guide (Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or v3.12
- **Git**: Installed

### 1️⃣ Clone Repository
```bash
git clone https://github.com/VedantVH/skylark-bi-copilot.git
cd skylark-bi-copilot
```

### 2️⃣ Configure & Start Backend
```bash
cd backend
cp .env.example .env

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies and start server
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Backend API will be running at `http://localhost:8000` (Docs at `/docs`)*

### 3️⃣ Configure & Start Frontend
```bash
# In a new terminal window:
cd frontend
cp .env.example .env.local

# Install dependencies and start development server
npm install
npm run dev
```
*Frontend will be running at `http://localhost:3000`*

---

## 🐳 Docker Deployment

To launch both frontend and backend services in isolated containers with a single command:

```bash
cp backend/.env.example backend/.env
docker-compose up --build -d
```
Access the application at `http://localhost:3000`.

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
|---|---|---|
| `/chat` | `POST` | Processes natural language prompt via Gemini Tool Planner |
| `/api/auth/login` | `POST` | Validates credentials & issues signed JWT token |
| `/api/auth/me` | `GET` | Returns active user profile from token |
| `/api/dashboard/summary` | `GET` | Aggregates all KPI, sector, stage, and aging metrics |
| `/api/dashboard/forecast` | `GET` | Computes 3-month forward-looking revenue forecast |
| `/api/dashboard/cross-board` | `GET` | Executes multi-board conversion join analysis |
| `/api/dashboard/data-quality` | `GET` | Evaluates field completeness across connected boards |
| `/api/reports/executive-summary` | `GET` | Generates structured board-level briefing document |
| `/api/reports/export-csv` | `GET` | Streams deal funnel telemetry as downloadable CSV |

*Interactive Swagger documentation is live at [https://render.com](http://localhost:8000/docs) when running locally.*

---

## 🧪 Testing & Validation

```bash
# Run Frontend Unit Tests
cd frontend
npm run test

# Run Production Build Check
npm run build
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Developed for Skylark Drones** • Powered by Next.js, FastAPI & Google Gemini

[**⭐️ Star this Repository on GitHub**](https://github.com/VedantVH/skylark-bi-copilot)

</div>
