/**
 * App-wide constants — all magic strings and numbers live here.
 * If a value changes across the app, this is the one place to update.
 */

export const APP_NAME = "Skylark BI Copilot";
export const APP_VERSION = "2.0.0";

/** Monday.com board IDs — used in source trace attribution */
export const BOARD_IDS = {
  DEALS: "5030219244",
  WORK_ORDERS: "5030219254",
} as const;

/** Approximate record counts (refreshed from live API on load) */
export const APPROX_RECORD_COUNTS = {
  DEALS: 345,
  WORK_ORDERS: 177,
} as const;

/** Health score thresholds for badge color decisions */
export const HEALTH_THRESHOLDS = {
  GOOD: 75,
  WARNING: 50,
} as const;

/** Data quality thresholds for field completeness progress bars */
export const QUALITY_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
} as const;

/** Chart colour palette — consistent across all visualisations */
export const CHART_PALETTE = [
  "#6366F1", // indigo
  "#06B6D4", // cyan
  "#10B981", // emerald
  "#F59E0B", // amber
  "#F43F5E", // rose
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#F97316", // orange
] as const;

/** Thinking step messages shown during AI query processing */
export const THINKING_STEPS = [
  "Querying Deals board…",
  "Cross-referencing Work Orders…",
  "Normalising sector taxonomy…",
  "Compiling executive insights…",
] as const;

/** Local storage keys — prevents typo-driven bugs */
export const STORAGE_KEYS = {
  TOKEN: "skylark_token",
  USER: "skylark_user",
} as const;

/** Starter prompt cards on the AI console sidebar */
export const STARTER_PROMPTS = [
  {
    title: "Energy & Power",
    desc: "Analyze Q3 revenue & deal pipeline",
    query: "How is our energy sector pipeline looking this quarter?",
    color: "#6366F1",
  },
  {
    title: "Work Order Status",
    desc: "Identify behind-schedule projects",
    query: "Which work orders are currently behind schedule?",
    color: "#10B981",
  },
  {
    title: "Billing & Collections",
    desc: "Billed value vs cash collected",
    query: "How much revenue has been billed vs collected across work orders?",
    color: "#F59E0B",
  },
  {
    title: "Board Briefing",
    desc: "Generate executive summary memo",
    query: "/leadership-update",
    color: "#F43F5E",
  },
] as const;
