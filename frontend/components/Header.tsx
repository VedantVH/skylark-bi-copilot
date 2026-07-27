'use client';

import React from 'react';
import {
  Sparkles,
  RefreshCw,
  Download,
  FileText,
  Activity,
  Layers,
  Shield,
  Database,
} from 'lucide-react';
import { getExportCsvUrl } from '@/lib/api';

interface HeaderProps {
  onRefresh: () => void;
  onOpenCopilot: () => void;
  onOpenReport: () => void;
  isRefreshing: boolean;
  healthScore?: number;
  dataQualityScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onOpenCopilot,
  onOpenReport,
  isRefreshing,
  healthScore = 0,
  dataQualityScore = 0,
}) => {
  const getHealthBadge = (score: number) => {
    if (score >= 75) return { label: 'Healthy', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (score >= 50) return { label: 'Moderate', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { label: 'Attention', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  };

  const healthBadge = getHealthBadge(healthScore);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#1e2d4a] bg-[#0a0f1e]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/40 border border-blue-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Skylark <span className="text-blue-400">BI Copilot</span>
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Monday.com CRM · Deals Board + Work Orders Board
            </p>
          </div>
        </div>

        {/* Status Badges + Controls */}
        <div className="flex items-center gap-2.5">
          {/* Health Score */}
          <div className={`hidden lg:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${healthBadge.color}`}>
            <Activity className="h-3.5 w-3.5" />
            <span>Health {healthScore}/100 · {healthBadge.label}</span>
          </div>

          {/* Data Quality */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-blue-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Data Quality {dataQualityScore}%</span>
          </div>

          {/* Divider */}
          <div className="hidden lg:block h-5 w-px bg-[#1e2d4a]" />

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-[#1e2d4a] bg-[#111827] px-3 py-2 text-[11px] font-medium text-slate-300 transition-all hover:border-blue-500/40 hover:bg-[#151e32] disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export CSV */}
          <a
            href={getExportCsvUrl()}
            download
            className="flex items-center gap-1.5 rounded-lg border border-[#1e2d4a] bg-[#111827] px-3 py-2 text-[11px] font-medium text-slate-300 transition-all hover:border-blue-500/40 hover:bg-[#151e32]"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </a>

          {/* Briefing */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 rounded-lg border border-[#243558] bg-[#1a2540] px-3.5 py-2 text-[11px] font-semibold text-slate-200 transition-all hover:bg-[#1e2d4a]"
          >
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span>Executive Brief</span>
          </button>

          {/* AI Copilot */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2 text-[11px] font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:from-blue-500 hover:to-blue-700 active:scale-95 border border-blue-500/30"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask AI Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
