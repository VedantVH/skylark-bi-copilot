/**
 * API service layer — single abstraction over all backend calls.
 * Swapping to a different backend is a one-file change: update API.baseURL.
 * All responses are validated with Zod so runtime shape mismatches are caught early.
 */

import axios, { AxiosInstance } from "axios";
import {
  DashboardSummaryResponse,
  DashboardSummaryResponseSchema,
  ExecutiveReport,
  ExecutiveReportSchema,
  ForecastResponse,
  ForecastResponseSchema,
  CrossBoardData,
  CrossBoardDataSchema,
  DataQualityReport,
  DataQualityReportSchema,
  LoginResponse,
  LoginResponseSchema,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const API: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Attach the JWT stored in localStorage on every outgoing request.
 * This runs only client-side (typeof window guard for SSR safety).
 */
API.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("skylark_token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// ── Auth ────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await API.post("/api/auth/login", { email, password });
  return LoginResponseSchema.parse(data);
}

export async function getMe(): Promise<LoginResponse["user"]> {
  const { data } = await API.get("/api/auth/me");
  return data;
}

// ── Chat ────────────────────────────────────────────────────────

export interface ChatApiResponse {
  answer: string;
  tool_used: string;
  insights: string[];
  risks: string[];
  recommendations: string[];
}

export async function sendChatMessage(
  message: string,
  sessionId = "default"
): Promise<ChatApiResponse> {
  const { data } = await API.post<ChatApiResponse>("/chat", {
    message,
    session_id: sessionId,
  });
  return data;
}

// ── Dashboard ───────────────────────────────────────────────────

export async function fetchDashboardSummary(): Promise<DashboardSummaryResponse> {
  const { data } = await API.get("/api/dashboard/summary");
  return DashboardSummaryResponseSchema.parse(data);
}

export async function fetchForecast(): Promise<ForecastResponse> {
  const { data } = await API.get("/api/dashboard/forecast");
  return ForecastResponseSchema.parse(data);
}

export async function fetchCrossBoard(): Promise<CrossBoardData> {
  const { data } = await API.get("/api/dashboard/cross-board");
  return CrossBoardDataSchema.parse(data);
}

export async function fetchDataQuality(): Promise<DataQualityReport> {
  const { data } = await API.get("/api/dashboard/data-quality");
  return DataQualityReportSchema.parse(data);
}

// ── Reports ─────────────────────────────────────────────────────

export async function fetchExecutiveReport(): Promise<ExecutiveReport> {
  const { data } = await API.get("/api/reports/executive-summary");
  return ExecutiveReportSchema.parse(data);
}

/**
 * Returns a pre-built URL for CSV download — used as an <a href> rather than
 * a fetch() call so the browser handles file save natively.
 */
export function getExportCsvUrl(): string {
  return `${BASE_URL}/api/reports/export-csv`;
}

export function getExportWorkOrdersCsvUrl(): string {
  return `${BASE_URL}/api/reports/export-workorders-csv`;
}
