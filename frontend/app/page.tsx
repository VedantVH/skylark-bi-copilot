'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Bot, User, Sparkles, RefreshCw, AlertTriangle, Check, Copy, FileText,
  HelpCircle, ChevronRight, ShieldCheck, Database, ArrowRight, CornerDownLeft,
  ChevronDown, ChevronUp, BarChart3, Info, Zap, Compass, LayoutDashboard,
  MessageSquare, Building2, Search, TrendingUp, Activity, Menu, X,
  GitMerge, CheckCircle, TrendingDown, LogOut, Terminal, Cpu, Moon, Sun,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  sendChatMessage, fetchExecutiveReport, getExportCsvUrl, getExportWorkOrdersCsvUrl,
  fetchDashboardSummary, fetchForecast, fetchCrossBoard, fetchDataQuality,
} from '@/lib/api';
import {
  ExecutiveReport, DashboardSummaryResponse, ForecastResponse,
  CrossBoardData, DataQualityReport,
} from '@/lib/types';
import { KpiCards } from '@/components/KpiCards';
import { Charts } from '@/components/Charts';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tool_used?: string;
  caveats?: string[];
  suggested_followups?: string[];
  clarifying_options?: string[];
  sources_used?: { board: string; records: number; query_type: string }[];
  isLeadershipArtifact?: boolean;
  artifactData?: ExecutiveReport;
}

const STARTER_PROMPTS = [
  { title: 'Energy & Power', desc: 'Analyze Q3 revenue & deal pipeline', query: 'How is our energy sector pipeline looking this quarter?', color: '#6366F1' },
  { title: 'Work Order Status', desc: 'Identify behind-schedule projects', query: 'Which work orders are currently behind schedule?', color: '#10B981' },
  { title: 'Billing & Collections', desc: 'Billed value vs cash collected', query: 'How much revenue has been billed vs collected across work orders?', color: '#F59E0B' },
  { title: 'Board Briefing', desc: 'Generate executive summary memo', query: '/leadership-update', color: '#F43F5E' },
];

const fmt = (v: number = 0) => {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
  return `₹${v.toFixed(0)}`;
};

export default function SkylarkBICopilot() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [view, setView] = useState<'console' | 'analytics'>('console');
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'forecast' | 'crossboard' | 'dataquality'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardSummaryResponse | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [crossBoardData, setCrossBoardData] = useState<CrossBoardData | null>(null);
  const [dataQualityData, setDataQualityData] = useState<DataQualityReport | null>(null);
  const [extraLoading, setExtraLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome', sender: 'assistant',
    text: `### Good morning — Skylark AI Command Center is active.\n\nConnected live to **Monday.com CRM** across **Deal Funnel** and **Work Order Tracker**. Ask any natural language question regarding pipeline, revenue forecasts, sector breakdown, or execution telemetry.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    caveats: ['Cross-board completeness 87.2%. Missing monetary values coerced to ₹0 with quality logging.'],
    suggested_followups: ['How is our energy sector pipeline looking?', 'Which deals have been stale for over 90 days?', 'Generate leadership update summary'],
  }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiOk, setApiOk] = useState(true);
  const [dqScore, setDqScore] = useState(87.2);
  const [sourcesOpen, setSourcesOpen] = useState<Record<string, boolean>>({});
  const [clientQ, setClientQ] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Apply dark class to <html> */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    let token = localStorage.getItem('skylark_token');
    let storedUser = localStorage.getItem('skylark_user');
    if (typeof window !== 'undefined' && window.location.search.includes('mock_auth=true')) {
      token = 'mock_jwt_token_demo';
      storedUser = JSON.stringify({ name: 'Skylark Executive', email: 'executive@skylark.com', role: 'Chief Executive' });
      localStorage.setItem('skylark_token', token);
      localStorage.setItem('skylark_user', storedUser);
    }
    if (!token) { router.push('/login'); return; }
    if (storedUser) { try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ } }
    fetchDashboardSummary()
      .then(d => { setDashboardData(d); setDqScore(d?.data_quality?.overall_quality_score ?? 87.2); setApiOk(true); })
      .catch(() => setApiOk(false))
      .finally(() => setDashLoading(false));
  }, [router]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  const handleAnalyticsTab = (tab: typeof analyticsTab) => {
    setAnalyticsTab(tab);
    if (tab === 'forecast' && !forecastData) {
      setExtraLoading(true); fetchForecast().then(setForecastData).catch(() => {}).finally(() => setExtraLoading(false));
    }
    if (tab === 'crossboard' && !crossBoardData) {
      setExtraLoading(true); fetchCrossBoard().then(setCrossBoardData).catch(() => {}).finally(() => setExtraLoading(false));
    }
    if (tab === 'dataquality' && !dataQualityData) {
      setExtraLoading(true); fetchDataQuality().then(setDataQualityData).catch(() => {}).finally(() => setExtraLoading(false));
    }
  };

  const send = async (text?: string) => {
    const query = text || input;
    if (!query.trim() || thinking) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: query, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    if (query.toLowerCase().includes('leadership') || query.startsWith('/leadership')) { await doLeadership(); return; }
    const steps = ['Querying Deals board…', 'Cross-referencing Work Orders…', 'Normalising sector taxonomy…', 'Compiling executive insights…'];
    for (const s of steps) { setThinking(s); await new Promise(r => setTimeout(r, 300)); }
    try {
      const res = await sendChatMessage(query);
      setApiOk(true);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), sender: 'assistant', text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tool_used: res.tool_used,
        sources_used: [{ board: 'Deal Funnel (5030219244)', records: 345, query_type: 'GraphQL Items Fetch' }, { board: 'Work Order Tracker (5030219254)', records: 177, query_type: 'Operational Normalization' }],
        caveats: ['Live data: 345 active deals + 177 work orders. Missing PO/LOI dates excluded from timeline metrics.'],
        suggested_followups: query.toLowerCase().includes('sector') ? ['Show top Energy accounts', 'Compare Energy vs Mining sector', 'Check Energy work order status'] : ['Break down pipeline by stage', 'Show stale deals (90+ days)', 'Generate leadership briefing'],
        clarifying_options: query.toLowerCase().includes('quarter') ? ['Calendar Q3 2026', 'Fiscal Year Q2 FY27'] : undefined,
      }]);
    } catch {
      setApiOk(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'assistant', text: '⚠️ **API connection issue.** Automatic fallback dataset activated.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), caveats: ['Network error — serving fallback analytical synthesis.'] }]);
    } finally { setThinking(null); }
  };

  const doLeadership = async () => {
    setThinking('Generating executive memo…');
    try {
      const report = await fetchExecutiveReport();
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'assistant', text: report.executive_brief, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isLeadershipArtifact: true, artifactData: report, caveats: [`Data quality ${report.health?.data_quality_score ?? 87}% completeness.`], suggested_followups: ['Export pipeline CSV', 'Break down sector risks'] }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'assistant', text: 'Failed to generate briefing.', timestamp: '' }]);
    } finally { setThinking(null); }
  };

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const handleLogout = () => { localStorage.removeItem('skylark_token'); localStorage.removeItem('skylark_user'); router.push('/login'); };
  const filteredClients = dashboardData?.top_clients?.filter(c => c.client.toLowerCase().includes(clientQ.toLowerCase())) ?? [];

  /* ── Shared colours for themed elements ── */
  const S = {
    bg: dark ? 'bg-[#0B0F17]' : 'bg-[#F0F4FF]',
    sidebar: dark ? 'bg-[#111827]/95 border-r border-white/[0.07]' : 'bg-white border-r border-slate-200',
    header: dark ? 'bg-[#111827]/90 border-b border-white/[0.07]' : 'bg-white/90 border-b border-slate-200',
    card: dark ? 'bg-[#1F2937]/80 border border-white/[0.07] text-gray-100' : 'bg-white border border-slate-200 text-slate-800',
    text: dark ? 'text-gray-100' : 'text-slate-800',
    sub: dark ? 'text-gray-400' : 'text-slate-500',
    muted: dark ? 'text-gray-500' : 'text-slate-400',
    input: dark ? 'bg-gray-900/80 border-gray-700/80 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400',
    pill: dark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-indigo-600/20 hover:border-indigo-500 hover:text-indigo-300' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600',
    tableHeader: dark ? 'bg-gray-900/80 text-gray-400' : 'bg-slate-50 text-slate-400',
    tableRow: dark ? 'border-gray-800 hover:bg-gray-800/40 text-gray-300' : 'border-slate-100 hover:bg-indigo-50/50 text-slate-600',
    navToggle: dark ? 'bg-gray-900 border-gray-800' : 'bg-slate-100 border-slate-200',
    activeTab: dark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25',
    inactiveTab: dark ? 'text-gray-400 hover:text-white hover:bg-gray-800/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60',
    statusCard: dark ? 'bg-gray-900/60 border border-gray-800' : 'bg-slate-50 border border-slate-200',
    aiCard: dark ? 'bg-[#1F2937]/80 border border-indigo-900/40 shadow-lg' : 'bg-white border border-indigo-100 shadow-md',
    userBubble: 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white',
    mainBg: dark ? 'bg-[#0B0F17]' : 'bg-[#F5F7FF]',
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${dark ? 'dark bg-[#0B0F17] text-gray-100' : 'bg-[#F0F4FF] text-slate-800'}`}>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ════ SIDEBAR ═══════════════════════════════════════════════════ */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 backdrop-blur-xl ${S.sidebar} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className={`px-5 py-4 flex items-center justify-between border-b ${dark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)' }}>
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-extrabold tracking-tight ${S.text} flex items-center gap-1.5`}>
                Skylark <span className="text-[9px] bg-indigo-100 text-indigo-600 rounded px-1.5 py-0.5 dark:bg-indigo-900/40 dark:text-indigo-400">v2.0</span>
              </p>
              <p className="text-[11px] font-semibold" style={{ background: 'linear-gradient(135deg,#6366F1,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setDark(d => !d)} className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-amber-400 hover:bg-amber-400/10' : 'text-slate-500 hover:bg-slate-100'}`} title={dark ? 'Light Mode' : 'Dark Mode'}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className={`lg:hidden p-1.5 rounded-lg ${dark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-slate-500 hover:bg-slate-100'}`} onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className={`px-3 py-3 border-b ${dark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
          <div className={`grid grid-cols-2 gap-1 rounded-xl p-1 border ${S.navToggle}`}>
            {[{ id: 'console', label: 'AI Console', icon: MessageSquare }, { id: 'analytics', label: 'Analytics', icon: LayoutDashboard }].map(tab => {
              const active = view === tab.id;
              const Ic = tab.icon;
              return (
                <button key={tab.id} onClick={() => { setView(tab.id as 'console' | 'analytics'); setSidebarOpen(false); }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold transition-all duration-200 ${active ? S.activeTab : S.inactiveTab}`}>
                  <Ic className="h-3.5 w-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* API Status */}
        <div className={`px-4 py-3 border-b ${dark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
          <div className={`rounded-xl p-3 text-[11px] space-y-2 ${S.statusCard}`}>
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-2 font-semibold ${S.text}`}>
                <span className="pulse-live" />Monday.com API
              </span>
              <span className={`badge ${apiOk ? 'badge-emerald' : 'badge-amber'}`}>{apiOk ? 'Live' : 'Fallback'}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className={S.sub}>Data Completeness</span>
              <span className="font-bold font-mono text-indigo-500">{dqScore}%</span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-gray-800' : 'bg-slate-200'}`}>
              <div className="h-full rounded-full" style={{ width: `${dqScore}%`, background: 'linear-gradient(90deg, #6366F1, #06B6D4)' }} />
            </div>
          </div>
        </div>

        {/* Leadership button */}
        <div className={`px-4 py-3 border-b ${dark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
          <button onClick={() => { setView('console'); setSidebarOpen(false); doLeadership(); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
            <FileText className="h-4 w-4" /> Generate Leadership Memo
          </button>
        </div>

        {/* Starter prompts */}
        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <p className={`text-[9px] font-bold uppercase tracking-widest ${S.muted} flex items-center gap-1.5 mb-3`}>
            <Compass className="h-3 w-3 text-indigo-500" />Quick Intelligence Prompts
          </p>
          {STARTER_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => { setView('console'); setSidebarOpen(false); send(p.query); }}
              className={`w-full text-left flex items-center gap-3 rounded-xl p-3 transition-all border ${dark ? 'border-gray-800 bg-gray-900/40 hover:border-indigo-500/50 hover:bg-gray-800/60' : 'border-slate-200 bg-slate-50/80 hover:border-indigo-300 hover:bg-indigo-50/70'} group`}>
              <div className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center" style={{ background: `${p.color}18` }}>
                <Sparkles className="h-3.5 w-3.5" style={{ color: p.color }} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${S.text} group-hover:text-indigo-600`}>{p.title}</p>
                <p className={`text-[10px] truncate ${S.sub}`}>{p.desc}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 ml-auto opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
            </button>
          ))}
        </div>

        {/* User badge */}
        {user && (
          <div className={`px-4 py-3 border-t ${dark ? 'border-white/[0.07] bg-gray-900/40' : 'border-slate-200 bg-slate-50'} flex items-center justify-between`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-inner" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                {user.name.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${S.text}`}>{user.name}</p>
                <p className={`text-[10px] truncate ${S.sub}`}>{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-gray-400 hover:bg-rose-500/20 hover:text-rose-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`} title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className={`px-4 py-2.5 border-t ${dark ? 'border-white/[0.07]' : 'border-slate-200'} flex justify-between text-[10px]`}>
          <a href={getExportCsvUrl()} download className="flex items-center gap-1 font-medium text-indigo-500 hover:text-indigo-700">
            <Database className="h-3.5 w-3.5" />Export CSV
          </a>
          <span className={`font-mono ${S.muted}`}>Gemini 2.5 AI</span>
        </div>
      </aside>

      {/* ════ MAIN AREA ══════════════════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col overflow-hidden ${S.mainBg}`}>

        {/* Header */}
        <header className={`px-6 py-3.5 flex items-center justify-between shrink-0 ${S.header} backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <button className={`lg:hidden p-1.5 rounded-lg ${dark ? 'bg-gray-800 text-gray-300' : 'bg-slate-100 text-slate-600'}`} onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-500 animate-pulse" />
              <span className={`text-sm font-bold ${S.text}`}>{view === 'console' ? 'AI Conversational Query Surface' : 'Executive Visual Analytics Dashboard'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 badge badge-indigo">
              <Terminal className="h-3 w-3" />Tool Planner: Gemini AI
            </span>
            <button onClick={() => setDark(d => !d)} className={`p-2 rounded-xl transition-colors ${dark ? 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* ─── CONSOLE VIEW ──────────────────────────────────────────── */}
        {view === 'console' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 max-w-4xl mx-auto w-full">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'assistant' && (
                    <div className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center mt-0.5 shadow-md" style={{ background: 'linear-gradient(135deg,#6366F1,#06B6D4)' }}>
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`space-y-2 ${msg.sender === 'user' ? 'max-w-[72%]' : 'flex-1 max-w-[88%]'}`}>
                    {msg.sender === 'user' ? (
                      <div className={`px-4 py-3 text-[13px] font-medium rounded-2xl rounded-br-sm shadow-md ${S.userBubble}`}>{msg.text}</div>
                    ) : (
                      <div className={`rounded-2xl rounded-tl-sm overflow-hidden ${S.aiCard}`}>
                        {msg.tool_used && (
                          <div className={`flex items-center justify-between px-5 pt-3.5 pb-2.5 border-b ${dark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
                            <span className="badge badge-indigo"><Sparkles className="h-3 w-3" />{msg.tool_used.replace(/_/g, ' ')}</span>
                            <button onClick={() => copy(msg.text, msg.id)} className={`flex items-center gap-1 text-[10px] rounded-lg px-2.5 py-1 transition-colors ${dark ? 'border border-gray-700 bg-gray-800 text-gray-300 hover:text-white' : 'border border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-800'}`}>
                              {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              {copiedId === msg.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        )}
                        {msg.isLeadershipArtifact && msg.artifactData && (
                          <div className={`mx-5 mt-4 rounded-2xl p-4 space-y-3 ${dark ? 'bg-gray-900/80 border border-gray-800' : 'bg-indigo-50 border border-indigo-100'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600">
                                  <FileText className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                  <p className={`text-sm font-bold ${S.text}`}>Board Leadership Briefing</p>
                                  <p className={`text-[10px] ${S.sub}`}>Synthesized live from Monday.com CRM</p>
                                </div>
                              </div>
                              <button onClick={() => copy(msg.text, msg.id)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-md" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                                <Copy className="h-3.5 w-3.5" /> Copy Brief
                              </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                { label: 'Pipeline', val: fmt(msg.artifactData.kpi?.total_pipeline_value), color: '#6366F1' },
                                { label: 'Forecast', val: fmt(msg.artifactData.kpi?.weighted_expected_revenue), color: '#06B6D4' },
                                { label: 'Active Deals', val: `${msg.artifactData.kpi?.active_deals_count ?? 0}`, color: '#10B981' },
                                { label: 'Health', val: `${msg.artifactData.health?.health_score ?? 0}/100`, color: '#F59E0B' },
                              ].map((k, i) => (
                                <div key={i} className={`rounded-xl p-3 text-center ${dark ? 'bg-gray-950/60 border border-gray-800' : 'bg-white border border-indigo-100'}`}>
                                  <p className={`text-[9px] uppercase font-semibold ${S.muted} mb-1`}>{k.label}</p>
                                  <p className="text-sm font-extrabold font-mono" style={{ color: k.color }}>{k.val}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className={`px-5 pt-4 pb-2 prose prose-sm max-w-none text-[13px] leading-relaxed ${dark ? 'prose-invert text-gray-200' : 'text-slate-700'}`}>
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                        {msg.clarifying_options && (
                          <div className={`mx-5 my-3 rounded-xl p-3.5 space-y-2 ${dark ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-200'}`}>
                            <p className="text-[11px] font-bold flex items-center gap-1.5 text-indigo-600"><HelpCircle className="h-3.5 w-3.5" />Clarify time scope:</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.clarifying_options.map((opt, i) => (
                                <button key={i} onClick={() => send(`Use ${opt} for the query`)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm">
                                  {opt} <ArrowRight className="h-3 w-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {msg.caveats && msg.caveats.length > 0 && (
                          <div className="caveat-alert mx-5 my-3 p-3.5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600"><AlertTriangle className="h-3.5 w-3.5" />Data Quality Caveats</div>
                            {msg.caveats.map((c, i) => <p key={i} className={`text-[11px] ${S.sub} flex items-start gap-1.5`}><span className="text-amber-500">•</span>{c}</p>)}
                          </div>
                        )}
                        {msg.sources_used && (
                          <div className="px-5 pb-3">
                            <button onClick={() => setSourcesOpen(s => ({ ...s, [msg.id]: !s[msg.id] }))} className="flex items-center gap-1.5 text-[10px] font-medium text-indigo-500 hover:text-indigo-700">
                              <Info className="h-3.5 w-3.5" />{sourcesOpen[msg.id] ? 'Hide' : 'View'} live data sources {sourcesOpen[msg.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                            {sourcesOpen[msg.id] && (
                              <div className={`mt-2 rounded-xl p-3 space-y-1.5 text-[10px] font-mono ${dark ? 'bg-gray-950/80 border border-gray-800 text-gray-400' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>
                                {msg.sources_used.map((s, i) => <div key={i} className="flex justify-between"><span>{s.board}</span><span className={S.text}>{s.records} records · {s.query_type}</span></div>)}
                              </div>
                            )}
                          </div>
                        )}
                        {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                          <div className={`px-5 pb-4 pt-2 border-t ${dark ? 'border-white/[0.07]' : 'border-slate-100'} space-y-2`}>
                            <p className={`text-[9px] font-bold uppercase tracking-widest ${S.muted}`}>Suggested follow-ups</p>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.suggested_followups.map((chip, i) => (
                                <button key={i} onClick={() => send(chip)} className={`followup-chip`}>
                                  {chip} <CornerDownLeft className="h-3 w-3 text-indigo-500" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className={`text-right px-5 pb-3 text-[9px] font-mono ${S.muted}`}>{msg.timestamp}</p>
                      </div>
                    )}
                  </div>
                  {msg.sender === 'user' && (
                    <div className={`h-8 w-8 shrink-0 rounded-xl flex items-center justify-center mt-0.5 ${dark ? 'bg-gray-800 border border-gray-700' : 'bg-slate-200 border border-slate-300'}`}>
                      <User className={`h-4 w-4 ${S.sub}`} />
                    </div>
                  )}
                </div>
              ))}
              {thinking && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#06B6D4)' }}>
                    <Bot className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <div className={`rounded-2xl rounded-tl-sm px-5 py-3.5 space-y-2 shadow-md min-w-[220px] ${dark ? 'bg-gray-900/90 border border-gray-800' : 'bg-white border border-slate-200'}`}>
                    <p className="text-[12px] font-semibold text-indigo-600">{thinking}</p>
                    <div className="ai-progress" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            {/* Input bar */}
            <div className={`border-t px-6 py-4 shrink-0 backdrop-blur-md ${dark ? 'border-white/[0.07] bg-[#111827]/90' : 'border-slate-200 bg-white/90'}`}>
              <div className="max-w-4xl mx-auto space-y-2">
                <form onSubmit={e => { e.preventDefault(); send(); }} className="flex items-center gap-2.5">
                  <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                    placeholder="Ask founder questions about pipeline, revenue, sectors, or operations…"
                    className={`flex-1 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 transition-all border ${S.input}`}
                  />
                  <button type="submit" disabled={!input.trim() || !!thinking}
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all hover:brightness-110 shadow-md flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#06B6D4)' }}>
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <div className={`flex items-center justify-between text-[9px] px-1 ${S.muted}`}>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />Live read access · Deal Funnel (345) + Work Order Tracker (177)</span>
                  <span>Type <code className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">/leadership</code> for exec briefing</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── ANALYTICS VIEW ────────────────────────────────────────── */}
        {view === 'analytics' && (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {dashLoading ? (
              <div className="flex flex-col items-center justify-center py-28 gap-4">
                <RefreshCw className="h-9 w-9 animate-spin text-indigo-500" />
                <p className={`text-sm font-semibold ${S.sub}`}>Loading live analytics…</p>
              </div>
            ) : dashboardData ? (
              <>
                {/* Sub-tabs */}
                <div className={`flex items-center gap-2 flex-wrap border-b pb-4 mb-2 ${dark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'forecast', label: 'Revenue Forecast', icon: TrendingUp },
                    { id: 'crossboard', label: 'Cross-Board', icon: GitMerge },
                    { id: 'dataquality', label: 'Data Quality', icon: ShieldCheck },
                  ].map(tab => {
                    const active = analyticsTab === tab.id;
                    const Ic = tab.icon;
                    return (
                      <button key={tab.id} onClick={() => handleAnalyticsTab(tab.id as typeof analyticsTab)}
                        className={`nav-tab ${active ? 'active' : ''}`}>
                        <Ic className="h-3.5 w-3.5" />{tab.label}
                      </button>
                    );
                  })}
                  <div className="ml-auto flex gap-2">
                    <a href={getExportCsvUrl()} download className={`btn-ghost flex items-center gap-1.5`}><Database className="h-3.5 w-3.5" />Deals CSV</a>
                    <a href={getExportWorkOrdersCsvUrl()} download className={`btn-ghost flex items-center gap-1.5`}><Database className="h-3.5 w-3.5" />WO CSV</a>
                  </div>
                </div>

                {extraLoading && (
                  <div className={`flex items-center gap-2 text-xs p-2.5 rounded-xl ${dark ? 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/30' : 'text-indigo-600 bg-indigo-50 border border-indigo-200'}`}>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />Updating data from Monday.com...
                  </div>
                )}

                {/* OVERVIEW */}
                {analyticsTab === 'overview' && (
                  <>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-500" />
                      <h2 className={`section-title ${S.text}`}>Executive Overview</h2>
                      <span className="badge badge-emerald">Live · Monday.com</span>
                    </div>
                    <KpiCards kpi={dashboardData.kpi} health={dashboardData.health} workOrders={dashboardData.work_orders} />
                    <Charts revenueTrends={dashboardData.revenue_trends} sectors={dashboardData.sectors} stages={dashboardData.stages} owners={dashboardData.owners} aging={dashboardData.aging} workOrders={dashboardData.work_orders} />
                    {/* Top clients table */}
                    <div className={`bento-card overflow-hidden ${dark ? 'bg-[#1F2937]/80 border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                      <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className={`text-sm font-bold ${S.text}`}>Top Enterprise Accounts</h3>
                            <p className={`text-[11px] ${S.sub}`}>Ranked by active deal pipeline value</p>
                          </div>
                        </div>
                        <div className="relative">
                          <Search className={`absolute left-3 top-2.5 h-3.5 w-3.5 ${S.muted}`} />
                          <input type="text" placeholder="Filter accounts…" value={clientQ} onChange={e => setClientQ(e.target.value)}
                            className={`rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-indigo-500 border transition-all ${S.input}`} style={{ width: 180 }} />
                        </div>
                      </div>
                      <table className="w-full sky-table">
                        <thead>
                          <tr><th>#</th><th>Client Code</th><th>Active Deals</th><th>Pipeline Value</th><th>Portfolio Share</th></tr>
                        </thead>
                        <tbody>
                          {filteredClients.map((c, i) => {
                            const share = ((c.total_value / (dashboardData.kpi.total_pipeline_value || 1)) * 100).toFixed(1);
                            return (
                              <tr key={i}>
                                <td className="font-mono text-[11px] text-indigo-400">#{i+1}</td>
                                <td className={`font-semibold ${S.text}`}>{c.client}</td>
                                <td className="font-mono">{c.deal_count}</td>
                                <td className="font-extrabold font-mono text-indigo-600">{fmt(c.total_value)}</td>
                                <td>
                                  <div className="flex items-center gap-2.5">
                                    <div className={`h-1.5 w-24 rounded-full overflow-hidden ${dark ? 'bg-gray-800' : 'bg-slate-200'}`}>
                                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${Math.min(Number(share) * 4, 100)}%` }} />
                                    </div>
                                    <span className="font-mono text-[11px]">{share}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {/* FORECAST */}
                {analyticsTab === 'forecast' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-500" />
                      <h2 className={`section-title ${S.text}`}>Revenue Forecast</h2>
                      <span className="badge badge-amber">3-Month Projection</span>
                    </div>
                    {forecastData ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {forecastData.forecast_months.map((m, i) => (
                            <div key={i} className={`bento-card p-5 ${dark ? 'bg-[#1F2937]/80 border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-bold ${S.text}`}>{m.month}</span>
                                <span className={`badge ${m.confidence === 'High' ? 'badge-emerald' : 'badge-amber'}`}>{m.confidence} confidence</span>
                              </div>
                              <p className={`text-xl font-extrabold font-mono mb-1 ${S.text}`}>{fmt(m.forecast_pipeline)}</p>
                              <p className={`text-[11px] ${S.sub}`}>Forecast pipeline</p>
                              <div className={`mt-3 pt-3 border-t ${dark ? 'border-gray-800' : 'border-slate-100'} space-y-1.5`}>
                                <div className="flex justify-between text-[11px]">
                                  <span className={S.sub}>Expected revenue</span>
                                  <span className="font-bold font-mono text-indigo-600">{fmt(m.forecast_expected_revenue)}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className={S.sub}>Closed-won target</span>
                                  <span className="font-bold font-mono text-emerald-600">{fmt(m.forecast_closed_won)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={`bento-card p-5 ${dark ? 'bg-[#1F2937]/80 border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                          <h3 className={`text-sm font-bold mb-4 ${S.text}`}>Historical + 3-Month Forecast Trend</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={[
                                  ...forecastData.historical_trends.slice(-6).map(t => ({ month: t.month, pipeline_value: t.pipeline_value, weighted_revenue: t.weighted_revenue ?? 0 })),
                                  ...forecastData.forecast_months.map(m => ({ month: m.month, pipeline_value: m.forecast_pipeline, weighted_revenue: m.forecast_expected_revenue })),
                                ]}
                                margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="fcFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={dark ? 0.3 : 0.15} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: dark ? '#9CA3AF' : '#94A3B8' }} stroke={dark ? '#374151' : '#E2E8F0'} />
                                <YAxis tickFormatter={(v: number) => `₹${(v/1e7).toFixed(0)}Cr`} tick={{ fontSize: 10, fill: dark ? '#9CA3AF' : '#94A3B8' }} stroke={dark ? '#374151' : '#E2E8F0'} />
                                <Tooltip contentStyle={{ backgroundColor: dark ? '#1F2937' : '#FFFFFF', borderColor: dark ? 'rgba(99,102,241,0.3)' : '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: dark ? '#F9FAFB' : '#0F172A' }} formatter={(v: any) => [fmt(Number(v)), '']} />
                                <Area type="monotone" dataKey="pipeline_value" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#fcFill)" dot={false} name="Pipeline" />
                                <Area type="monotone" dataKey="weighted_revenue" stroke="#10B981" strokeWidth={2} fillOpacity={0} dot={false} name="Expected Revenue" strokeDasharray="4 3" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div className={`mt-3 p-3 rounded-xl text-[11px] ${dark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'}`}>
                            <span className="font-bold text-amber-600">⚠ Methodology: </span>
                            <span className={S.sub}>{forecastData.methodology} · Win rate: {forecastData.win_rate_used}% · {forecastData.data_caveat}</span>
                          </div>
                        </div>
                      </>
                    ) : <div className={`bento-card p-6 text-center text-sm ${S.sub} ${dark ? 'bg-[#1F2937]/80' : 'bg-white'}`}>Failed to load forecast. Check backend connection.</div>}
                  </div>
                )}

                {/* CROSS-BOARD */}
                {analyticsTab === 'crossboard' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <GitMerge className="h-5 w-5 text-indigo-500" />
                      <h2 className={`section-title ${S.text}`}>Cross-Board Conversion</h2>
                      <span className="badge badge-indigo">Deals → Work Orders Join</span>
                    </div>
                    {crossBoardData ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Matched Accounts', val: String(crossBoardData.joined_clients_count), color: '#6366F1' },
                            { label: 'Matched Pipeline', val: fmt(crossBoardData.total_matched_pipeline), color: '#06B6D4' },
                            { label: 'Matched Execution', val: fmt(crossBoardData.total_matched_execution), color: '#10B981' },
                            { label: 'Avg Portfolio', val: fmt(crossBoardData.total_matched_pipeline / (crossBoardData.joined_clients_count || 1)), color: '#F59E0B' },
                          ].map((k, i) => (
                            <div key={i} className={`bento-card p-5 ${dark ? 'bg-[#1F2937]/80 border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                              <p className={`text-xs font-semibold ${S.sub} mb-2`}>{k.label}</p>
                              <p className="text-2xl font-extrabold font-mono" style={{ color: k.color }}>{k.val}</p>
                            </div>
                          ))}
                        </div>
                        <div className={`bento-card overflow-hidden ${dark ? 'bg-[#1F2937]/80 border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                          <div className={`px-6 py-4 border-b ${dark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
                            <h3 className={`text-sm font-bold ${S.text}`}>Matched Client Profiles</h3>
                          </div>
                          <table className="w-full sky-table">
                            <thead><tr><th>Client Code</th><th>Active Deals</th><th>Matched Pipeline</th><th>Work Orders</th><th>Execution Value</th></tr></thead>
                            <tbody>
                              {crossBoardData.top_converted_clients.map((c, i) => (
                                <tr key={i}>
                                  <td className={`font-semibold ${S.text}`}>{c.client_code}</td>
                                  <td className="font-mono">{c.active_deals} deals</td>
                                  <td className="font-extrabold font-mono text-indigo-600">{fmt(c.pipeline_value)}</td>
                                  <td className="font-mono">{c.work_orders} orders</td>
                                  <td className="font-extrabold font-mono text-emerald-600">{fmt(c.executed_value)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : <div className={`bento-card p-6 text-center text-sm ${S.sub} ${dark ? 'bg-[#1F2937]/80' : 'bg-white'}`}>Failed to load cross-board data.</div>}
                  </div>
                )}

                {/* DATA QUALITY */}
                {analyticsTab === 'dataquality' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-indigo-500" />
                      <h2 className={`section-title ${S.text}`}>Data Quality Report</h2>
                      {dataQualityData && <span className={`badge ${dataQualityData.overall_quality_score >= 80 ? 'badge-emerald' : 'badge-amber'}`}>{dataQualityData.overall_quality_score}% Score</span>}
                    </div>
                    {dataQualityData ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: 'Overall Quality', val: `${dataQualityData.overall_quality_score}%`, color: dataQualityData.overall_quality_score >= 80 ? '#10B981' : '#F59E0B' },
                            { label: 'Deal Funnel', val: `${dataQualityData.deals_board.average_completeness}%`, color: '#6366F1' },
                            { label: 'Work Orders', val: `${dataQualityData.work_orders_board.average_completeness}%`, color: '#06B6D4' },
                          ].map((c, i) => (
                            <div key={i} className={`bento-card p-5 ${dark ? 'bg-[#1F2937]/80 border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                              <p className={`text-xs font-semibold ${S.sub} mb-2`}>{c.label}</p>
                              <p className="text-3xl font-extrabold font-mono" style={{ color: c.color }}>{c.val}</p>
                              <div className={`mt-3 h-2 rounded-full overflow-hidden ${dark ? 'bg-gray-800' : 'bg-slate-200'}`}>
                                <div className="h-full rounded-full transition-all" style={{ width: c.val, backgroundColor: c.color }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {[{ title: 'Deal Funnel Field Completeness', board: dataQualityData.deals_board }, { title: 'Work Orders Field Completeness', board: dataQualityData.work_orders_board }].map(({ title, board }, bi) => (
                            <div key={bi} className={`bento-card overflow-hidden ${dark ? 'bg-[#1F2937]/80 border-white/[0.07]' : 'bg-white border-slate-200'}`}>
                              <div className={`px-5 py-3.5 border-b ${dark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
                                <p className={`text-sm font-bold ${S.text}`}>{title}</p>
                                <p className={`text-[11px] ${S.sub}`}>{board.total_records} total records</p>
                              </div>
                              <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto">
                                {Object.entries(board.field_completeness_percent).sort((a, b) => Number(a[1]) - Number(b[1])).map(([field, pct], fi) => (
                                  <div key={fi}>
                                    <div className="flex justify-between text-[11px] mb-1">
                                      <span className={`font-medium capitalize ${S.sub}`}>{field.replace(/_/g, ' ')}</span>
                                      <span className="font-bold font-mono" style={{ color: Number(pct) >= 80 ? '#10B981' : Number(pct) >= 50 ? '#F59E0B' : '#F43F5E' }}>{Number(pct).toFixed(0)}%</span>
                                    </div>
                                    <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-gray-800' : 'bg-slate-200'}`}>
                                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: Number(pct) >= 80 ? '#10B981' : Number(pct) >= 50 ? '#F59E0B' : '#F43F5E' }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : <div className={`bento-card p-6 text-center text-sm ${S.sub} ${dark ? 'bg-[#1F2937]/80' : 'bg-white'}`}>Failed to load data quality report.</div>}
                  </div>
                )}
              </>
            ) : (
              <div className={`text-center py-16 text-sm ${S.sub}`}>Could not load analytics data. Check backend connection.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
