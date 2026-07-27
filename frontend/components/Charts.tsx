'use client';

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { RevenueTrend, SectorItem, StageItem, OwnerItem, AgingBucket, WorkOrderAnalytics } from '@/lib/types';
import { TrendingUp, PieChart as PieIcon, Users, Clock, Wrench } from 'lucide-react';

interface ChartsProps {
  revenueTrends?: RevenueTrend[];
  sectors?: SectorItem[];
  stages?: StageItem[];
  owners?: OwnerItem[];
  aging?: AgingBucket[];
  workOrders?: WorkOrderAnalytics;
}

const PALETTE = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#14B8A6', '#F97316'];

const fmt = (v: number) => {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(0)}L`;
  return `₹${v.toFixed(0)}`;
};

/* Tooltip style adapts to dark class on <html> */
const getTooltipStyle = () => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return {
    contentStyle: {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderColor: isDark ? 'rgba(99,102,241,0.3)' : '#E2E8F0',
      borderRadius: '12px',
      color: isDark ? '#F9FAFB' : '#0F172A',
      fontSize: '11px',
      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 16px rgba(99,102,241,0.12)',
    },
    cursor: { fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.04)' },
  };
};

const gridStroke = () => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
};

const axisStyle = () => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return { fill: isDark ? '#9CA3AF' : '#94A3B8', fontSize: 10 };
};

const axisLine = () => {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return isDark ? '#374151' : '#E2E8F0';
};

interface CardWrapperProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}

const CardWrapper: React.FC<CardWrapperProps> = ({ title, subtitle, icon, accent, children }) => (
  <div className="bento-card p-5 flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}30` }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

export const Charts: React.FC<ChartsProps> = ({ revenueTrends, sectors, stages, owners, aging, workOrders }) => {
  const ts = getTooltipStyle();
  const gs = gridStroke();
  const as = axisStyle();
  const al = axisLine();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

      {/* Revenue Trend — Area */}
      <div className="md:col-span-2">
        <CardWrapper title="Revenue Trend" subtitle="Monthly pipeline vs expected revenue" accent="#6366F1"
          icon={<TrendingUp className="h-4.5 w-4.5" style={{ color: '#6366F1' }} />}>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrends ?? []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="rvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gs} />
                <XAxis dataKey="month" tick={as} stroke={al} />
                <YAxis tickFormatter={(v: number) => `₹${(v / 1e7).toFixed(0)}Cr`} tick={as} stroke={al} />
                <Tooltip {...ts} formatter={(v: any) => [fmt(Number(v)), '']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="pipeline_value"       name="Pipeline"         stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#rvGrad)" dot={false} />
                <Area type="monotone" dataKey="weighted_revenue"     name="Expected Revenue" stroke="#06B6D4" strokeWidth={2}   fillOpacity={1} fill="url(#exGrad)" dot={false} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardWrapper>
      </div>

      {/* Sector Breakdown — Bar */}
      <CardWrapper title="Sector Breakdown" subtitle="Pipeline value per industry vertical" accent="#10B981"
        icon={<PieIcon className="h-4.5 w-4.5" style={{ color: '#10B981' }} />}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectors ?? []} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gs} horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `₹${(v / 1e7).toFixed(0)}Cr`} tick={as} stroke={al} />
              <YAxis type="category" dataKey="sector" tick={{ ...as, fontSize: 9 }} stroke={al} width={72} />
              <Tooltip {...ts} formatter={(v: any) => [fmt(Number(v)), 'Pipeline']} />
              <Bar dataKey="total_value" radius={[0, 6, 6, 0]}>
                {(sectors ?? []).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardWrapper>

      {/* Stage Funnel — Horizontal Bar */}
      <CardWrapper title="Deal Stage Funnel" subtitle="Pipeline value by deal stage" accent="#F59E0B"
        icon={<PieIcon className="h-4.5 w-4.5" style={{ color: '#F59E0B' }} />}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stages ?? []} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gs} horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `₹${(v / 1e7).toFixed(0)}Cr`} tick={as} stroke={al} />
              <YAxis type="category" dataKey="stage" tick={{ ...as, fontSize: 9 }} stroke={al} width={80} />
              <Tooltip {...ts} formatter={(v: any) => [fmt(Number(v)), 'Stage Value']} />
              <Bar dataKey="total_value" radius={[0, 6, 6, 0]}>
                {(stages ?? []).map((_, i) => <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardWrapper>

      {/* Owners leaderboard — Bar */}
      <CardWrapper title="Sales Leaderboard" subtitle="Pipeline value by account owner" accent="#6366F1"
        icon={<Users className="h-4.5 w-4.5" style={{ color: '#6366F1' }} />}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={(owners ?? []).slice(0, 8)} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gs} />
              <XAxis dataKey="owner" tick={{ ...as, fontSize: 9 }} stroke={al} />
              <YAxis tickFormatter={(v: number) => `₹${(v / 1e7).toFixed(0)}Cr`} tick={as} stroke={al} />
              <Tooltip {...ts} formatter={(v: any) => [fmt(Number(v)), 'Pipeline']} />
              <Bar dataKey="total_value" radius={[6, 6, 0, 0]}>
                {(owners ?? []).slice(0, 8).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardWrapper>

      {/* Deal Aging — Pie */}
      <CardWrapper title="Deal Aging Analysis" subtitle="Portfolio distribution by deal age" accent="#F43F5E"
        icon={<Clock className="h-4.5 w-4.5" style={{ color: '#F43F5E' }} />}>
        <div className="flex flex-col items-center">
          <div className="h-48">
            <ResponsiveContainer width={200} height="100%">
              <PieChart>
                <Pie data={aging ?? []} dataKey="deal_count" nameKey="bucket" cx="50%" cy="50%" outerRadius={72} innerRadius={36} strokeWidth={0}>
                  {(aging ?? []).map((_, i) => <Cell key={i} fill={PALETTE[(i + 3) % PALETTE.length]} />)}
                </Pie>
                <Tooltip {...ts} formatter={(v: any, name: any) => [v, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 w-full mt-1">
            {(aging ?? []).map((bucket, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PALETTE[(i + 3) % PALETTE.length] }} />
                <span style={{ color: 'var(--text-secondary)' }}>{bucket.bucket}: <b style={{ color: 'var(--text-primary)' }}>{bucket.count}</b></span>
              </div>
            ))}
          </div>
        </div>
      </CardWrapper>

      {/* Work Orders — Status split */}
      {workOrders && (
        <div className="md:col-span-2">
          <CardWrapper title="Work Order Execution" subtitle="Status split across all active work orders" accent="#10B981"
            icon={<Wrench className="h-4.5 w-4.5" style={{ color: '#10B981' }} />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total WOs',       val: workOrders.total_work_orders,              color: '#6366F1' },
                { label: 'Contract Value',  val: fmt(workOrders.total_contract_value),       color: '#06B6D4' },
                { label: 'Billed Value',    val: fmt(workOrders.total_billed_value),         color: '#10B981' },
                { label: 'Billing Rate',    val: `${workOrders.billing_rate_percent ?? 0}%`, color: '#F59E0B' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-4 text-center border" style={{ borderColor: `${s.color}30`, background: `${s.color}0A` }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="text-lg font-extrabold font-mono" style={{ color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
          </CardWrapper>
        </div>
      )}
    </div>
  );
};
