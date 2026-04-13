import { authFetch, authHeaders, handleResponse } from "./base";

const API_BASE_LOCAL = (import.meta.env.VITE_API_BASE_URL || "https://new-comaping.onrender.com").replace(/\/+$/, "");

// Raw shape from /api/campaigns/summary/
interface RawSummary {
  total: number;
  by_status: Record<string, number>;
  by_execution_status: Record<string, number>;
  by_channel: Record<string, number>;
  total_recipients: number;
  total_processed: number;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
}

export interface DashboardSummary {
  total_campaigns: number;
  active_campaigns: number;
  completed_campaigns: number;
  draft_campaigns: number;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  total_processed: number;
  avg_delivery_rate: number;
  by_status: Record<string, number>;
  by_execution_status: Record<string, number>;
  by_channel: Record<string, number>;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/summary/`, { headers: authHeaders() });
  const raw = await handleResponse<RawSummary>(res);

  const active = raw.by_status?.active ?? 0;
  const completed = raw.by_status?.completed ?? 0;
  const draft = raw.by_status?.draft ?? 0;
  const totalSent = raw.total_sent ?? 0;
  const totalDelivered = raw.total_delivered ?? 0;

  return {
    total_campaigns: raw.total ?? 0,
    active_campaigns: active,
    completed_campaigns: completed,
    draft_campaigns: draft,
    total_recipients: raw.total_recipients ?? 0,
    total_sent: totalSent,
    total_delivered: totalDelivered,
    total_failed: raw.total_failed ?? 0,
    total_processed: raw.total_processed ?? 0,
    avg_delivery_rate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
    by_status: raw.by_status ?? {},
    by_execution_status: raw.by_execution_status ?? {},
    by_channel: raw.by_channel ?? {},
  };
}
