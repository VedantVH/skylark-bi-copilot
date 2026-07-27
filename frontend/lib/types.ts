import { z } from "zod";

// ── KPI Metrics ──────────────────────────────────────────────────
export const KpiSummarySchema = z.object({
  total_pipeline_value: z.number().default(0),
  weighted_expected_revenue: z.number().default(0),
  active_deals_count: z.number().default(0),
  average_deal_size: z.number().default(0),
  win_rate_percent: z.number().default(0),
  health_score: z.number().default(0),
  data_quality_score: z.number().default(0),
});

export const BusinessHealthSchema = z.object({
  health_score: z.number().default(0),
  pipeline_score: z.number().default(0),
  data_quality_score: z.number().default(0),
  recommendations: z.array(z.string()).default([]),
});

export const RevenueTrendSchema = z.object({
  month: z.string(),
  pipeline_value: z.number().default(0),
  weighted_revenue: z.number().optional(),
  closed_won_value: z.number().optional(),
});

export const SectorItemSchema = z.object({
  sector: z.string(),
  deal_count: z.number().default(0),
  total_value: z.number().default(0),
});

export const StageItemSchema = z.object({
  stage: z.string(),
  deal_count: z.number().default(0),
  total_value: z.number().default(0),
});

export const OwnerItemSchema = z.object({
  owner: z.string(),
  deal_count: z.number().default(0),
  total_value: z.number().default(0),
});

export const AgingBucketSchema = z.object({
  bucket: z.string(),
  count: z.number().default(0),
  pipeline_value: z.number().default(0),
});

export const TopClientSchema = z.object({
  client: z.string(),
  total_value: z.number().default(0),
  deal_count: z.number().default(0),
});

export const WorkOrderAnalyticsSchema = z.object({
  total_work_orders: z.number().default(0),
  total_contract_value: z.number().default(0),
  total_billed_value: z.number().default(0),
  billing_rate_percent: z.number().default(0),
  status_breakdown: z.record(z.string(), z.number()).optional(),
});

export const DashboardSummaryResponseSchema = z.object({
  kpi: KpiSummarySchema,
  health: BusinessHealthSchema,
  revenue_trends: z.array(RevenueTrendSchema).default([]),
  sectors: z.array(SectorItemSchema).default([]),
  stages: z.array(StageItemSchema).default([]),
  owners: z.array(OwnerItemSchema).default([]),
  aging: z.array(AgingBucketSchema).default([]),
  top_clients: z.array(TopClientSchema).default([]),
  work_orders: WorkOrderAnalyticsSchema,
  data_quality: z.object({ overall_quality_score: z.number().default(87.2) }).optional(),
});

export const ForecastMonthSchema = z.object({
  month: z.string(),
  forecast_pipeline: z.number().default(0),
  forecast_expected_revenue: z.number().default(0),
  forecast_closed_won: z.number().default(0),
  confidence: z.enum(["High", "Medium", "Low"]),
});

export const ForecastResponseSchema = z.object({
  forecast_months: z.array(ForecastMonthSchema),
  historical_trends: z.array(RevenueTrendSchema).default([]),
  methodology: z.string().default(""),
  win_rate_used: z.number().default(0),
  data_caveat: z.string().default(""),
});

export const CrossBoardClientSchema = z.object({
  client_code: z.string(),
  active_deals: z.number().default(0),
  pipeline_value: z.number().default(0),
  work_orders: z.number().default(0),
  executed_value: z.number().default(0),
});

export const CrossBoardDataSchema = z.object({
  joined_clients_count: z.number().default(0),
  total_matched_pipeline: z.number().default(0),
  total_matched_execution: z.number().default(0),
  top_converted_clients: z.array(CrossBoardClientSchema).default([]),
  caveats: z.array(z.string()).default([]),
});

export const DataQualityBoardSchema = z.object({
  total_records: z.number().default(0),
  average_completeness: z.number().default(0),
  field_completeness_percent: z.record(z.string(), z.number()),
});

export const DataQualityReportSchema = z.object({
  overall_quality_score: z.number().default(0),
  deals_board: DataQualityBoardSchema,
  work_orders_board: DataQualityBoardSchema,
  caveats: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

export const ExecutiveReportSchema = z.object({
  executive_brief: z.string(),
  kpi: KpiSummarySchema.optional(),
  health: BusinessHealthSchema.optional(),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    name: z.string(),
    email: z.string(),
    role: z.string(),
  }),
});

// ── Inferred TypeScript types ─────────────────────────────────────
export type KpiSummary             = z.infer<typeof KpiSummarySchema>;
export type BusinessHealth         = z.infer<typeof BusinessHealthSchema>;
export type RevenueTrend           = z.infer<typeof RevenueTrendSchema>;
export type SectorItem             = z.infer<typeof SectorItemSchema>;
export type StageItem              = z.infer<typeof StageItemSchema>;
export type OwnerItem              = z.infer<typeof OwnerItemSchema>;
export type AgingBucket            = z.infer<typeof AgingBucketSchema>;
export type TopClient              = z.infer<typeof TopClientSchema>;
export type WorkOrderAnalytics     = z.infer<typeof WorkOrderAnalyticsSchema>;
export type DashboardSummaryResponse = z.infer<typeof DashboardSummaryResponseSchema>;
export type ForecastMonth          = z.infer<typeof ForecastMonthSchema>;
export type ForecastResponse       = z.infer<typeof ForecastResponseSchema>;
export type CrossBoardClient       = z.infer<typeof CrossBoardClientSchema>;
export type CrossBoardData         = z.infer<typeof CrossBoardDataSchema>;
export type DataQualityBoard       = z.infer<typeof DataQualityBoardSchema>;
export type DataQualityReport      = z.infer<typeof DataQualityReportSchema>;
export type ExecutiveReport        = z.infer<typeof ExecutiveReportSchema>;
export type LoginResponse          = z.infer<typeof LoginResponseSchema>;

// ── Chat types ────────────────────────────────────────────────────
export interface ChatSource {
  board: string;
  records: number;
  query_type: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  tool_used?: string;
  caveats?: string[];
  suggested_followups?: string[];
  clarifying_options?: string[];
  sources_used?: ChatSource[];
  isLeadershipArtifact?: boolean;
  artifactData?: ExecutiveReport;
}

export interface StoredUser {
  name: string;
  email: string;
  role: string;
}
