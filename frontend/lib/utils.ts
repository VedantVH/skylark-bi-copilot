/**
 * Currency formatting utilities for Indian number system.
 * Extracted from JSX to keep components presentation-only.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely — resolves conflicts like "p-2 p-4" → "p-4".
 * Required by shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a rupee value into human-readable Indian scale:
 * - ≥ 1 Crore  → "₹X.XXCr"
 * - ≥ 1 Lakh   → "₹X.XL"
 * - Otherwise  → "₹X"
 *
 * @param value - Raw numeric value in rupees. Defaults to 0 if undefined.
 */
export function formatRupee(value: number = 0): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  return `₹${value.toFixed(0)}`;
}

/**
 * Compact version for chart axis ticks where space is limited.
 */
export function formatRupeeCompact(value: number): string {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(0)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(0)}L`;
  return `₹${value.toFixed(0)}`;
}

/**
 * Clamps a percentage to [0, 100] so progress bars never overflow.
 */
export function clampPercent(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/**
 * Calculates a client's portfolio share of total pipeline, clamped to [0,100].
 * Returns 0 when total is zero to avoid division-by-zero.
 */
export function portfolioShare(clientValue: number, totalPipeline: number): number {
  if (totalPipeline === 0) return 0;
  return clampPercent((clientValue / totalPipeline) * 100);
}

/**
 * Formats a timestamp for display in chat messages.
 */
export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Determines health status label from a numeric score.
 * Keeps this logic out of render functions so it's independently testable.
 */
export function healthLabel(score: number): string {
  if (score >= 75) return "Pipeline healthy";
  if (score >= 50) return "Needs attention";
  return "Action required";
}
