'use client';

import React from 'react';
import { DollarSign, TrendingUp, Wrench, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { KpiSummary, BusinessHealth, WorkOrderAnalytics } from '@/lib/types';

interface KpiCardsProps {
  kpi?: KpiSummary;
  health?: BusinessHealth;
  workOrders?: WorkOrderAnalytics;
}

const fmt = (val: number = 0) => {
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)}Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(1)}L`;
  return `₹${val.toFixed(0)}`;
};

export const KpiCards: React.FC<KpiCardsProps> = ({ kpi, health, workOrders }) => {
  const healthScore = health?.health_score ?? kpi?.health_score ?? 0;

  const cards = [
    {
      label: 'TOTAL PIPELINE',
      value: fmt(kpi?.total_pipeline_value),
      sub: `${kpi?.active_deals_count ?? 0} active deals in funnel`,
      delta: `Avg ${fmt(kpi?.average_deal_size)} / deal`,
      positive: true,
      icon: DollarSign,
      accent: '#6366F1',
      accentLight: '#EEF2FF',
    },
    {
      label: 'EXPECTED REVENUE',
      value: fmt(kpi?.weighted_expected_revenue),
      sub: 'Probability-adjusted forecast',
      delta: `${kpi?.win_rate_percent ?? 0}% est. win rate`,
      positive: true,
      icon: TrendingUp,
      accent: '#06B6D4',
      accentLight: '#ECFEFF',
    },
    {
      label: 'WORK ORDER VALUE',
      value: fmt(workOrders?.total_contract_value),
      sub: `${workOrders?.total_work_orders ?? 0} total work orders`,
      delta: `${workOrders?.billing_rate_percent ?? 0}% billed`,
      positive: (workOrders?.billing_rate_percent ?? 0) >= 50,
      icon: Wrench,
      accent: '#10B981',
      accentLight: '#ECFDF5',
    },
    {
      label: 'BUSINESS HEALTH',
      value: `${healthScore}/100`,
      sub: `Data quality: ${kpi?.data_quality_score ?? 87}%`,
      delta: healthScore >= 75 ? 'Pipeline healthy' : healthScore >= 50 ? 'Needs attention' : 'Action required',
      positive: healthScore >= 60,
      icon: ShieldCheck,
      accent: healthScore >= 60 ? '#10B981' : '#F43F5E',
      accentLight: healthScore >= 60 ? '#ECFDF5' : '#FFF1F2',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const DeltaIcon = card.positive ? ArrowUpRight : ArrowDownRight;
        return (
          <div
            key={idx}
            className="bento-card p-5 group cursor-default"
            style={{ '--card-accent': card.accent } as React.CSSProperties}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${card.accent}18`,
                  border: `1px solid ${card.accent}35`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color: card.accent }} />
              </div>
            </div>

            {/* Value */}
            <div className="text-2xl font-extrabold tracking-tight mb-1 font-mono" style={{ color: 'var(--text-primary)' }}>
              {card.value}
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{card.sub}</p>

            {/* Delta */}
            <div className="flex items-center gap-1">
              <DeltaIcon className="h-3.5 w-3.5" style={{ color: card.positive ? '#10B981' : '#F43F5E' }} />
              <span className="text-xs font-semibold" style={{ color: card.positive ? '#10B981' : '#F43F5E' }}>
                {card.delta}
              </span>
            </div>

            {/* Accent bottom bar */}
            <div
              className="mt-4 h-0.5 w-full rounded-full opacity-25 group-hover:opacity-70 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${card.accent} 0%, transparent 100%)` }}
            />
          </div>
        );
      })}
    </div>
  );
};
