'use client';

import React, { useEffect, useState } from 'react';
import { X, FileText, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchExecutiveReport } from '@/lib/api';
import { ExecutiveReport } from '@/lib/types';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) loadReport();
  }, [isOpen]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await fetchExecutiveReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to load report', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fmtCr = (v: number = 0) => {
    if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`;
    if (v >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
    return `₹${v.toFixed(0)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1e]/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#1e2d4a] bg-[#0d1428] shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2d4a] px-6 py-4 bg-[#0a0f1e]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Executive Business Briefing</h2>
              <p className="text-[11px] text-slate-500">Board-level AI synthesis · Monday.com Data</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadReport}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-[#1e2d4a] bg-[#111827] px-3 py-1.5 text-[11px] text-slate-300 hover:bg-[#1a2540] transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              Refresh
            </button>
            <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-[#1a2540] hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Generating Executive Brief</p>
                <p className="text-[11px] text-slate-500 mt-1">Gemini AI is synthesizing your business data…</p>
              </div>
            </div>
          ) : report ? (
            <>
              {/* KPI Summary Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Pipeline Value', value: fmtCr(report.kpi?.total_pipeline_value), color: 'border-blue-500/20 bg-blue-500/5' },
                  { label: 'Expected Revenue', value: fmtCr(report.kpi?.weighted_expected_revenue), color: 'border-indigo-500/20 bg-indigo-500/5' },
                  { label: 'Active Deals', value: String(report.kpi?.active_deals_count ?? 0), color: 'border-slate-500/20 bg-slate-500/5' },
                  { label: 'Health Score', value: `${report.health?.health_score ?? 0}/100`, color: 'border-emerald-500/20 bg-emerald-500/5' },
                ].map((item, i) => (
                  <div key={i} className={`rounded-xl border ${item.color} p-3 text-center`}>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* AI Executive Synthesis */}
              <div className="rounded-xl border border-[#1e2d4a] bg-[#111827] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Executive Synthesis</h3>
                </div>
                <div className="prose prose-invert prose-xs max-w-none [&_h2]:text-xs [&_h3]:text-[11px] [&_p]:text-slate-300 [&_li]:text-slate-300 [&_strong]:text-white">
                  <ReactMarkdown>{report.executive_brief}</ReactMarkdown>
                </div>
              </div>

              {/* Insights / Risks / Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-1.5 mb-3 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Growth Insights</span>
                  </div>
                  <ul className="space-y-2">
                    {report.insights?.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                  <div className="flex items-center gap-1.5 mb-3 text-rose-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Critical Risks</span>
                  </div>
                  <ul className="space-y-2">
                    {report.risks?.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <span className="text-rose-500 mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex items-center gap-1.5 mb-3 text-blue-400">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Action Items</span>
                  </div>
                  <ul className="space-y-2">
                    {report.recommendations?.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-[11px] text-slate-500 py-10">Could not load executive briefing.</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1e2d4a] px-6 py-3 bg-[#0a0f1e] flex items-center justify-between">
          <p className="text-[10px] text-slate-600">Generated by Gemini AI · Live Monday.com data</p>
          <button onClick={onClose} className="rounded-xl border border-[#1e2d4a] bg-[#111827] px-5 py-2 text-[11px] font-semibold text-slate-200 hover:bg-[#1a2540] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
