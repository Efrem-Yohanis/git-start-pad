import { authFetch, authHeaders, handleResponse } from "./base";

const API_BASE_LOCAL = (import.meta.env.VITE_API_BASE_URL || "https://new-comaping.onrender.com").replace(/\/+$/, "");

export interface DashboardSummary {
  total_campaigns: number;
  active_campaigns: number;
  completed_campaigns: number;
  draft_campaigns: number;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  avg_delivery_rate: number;
  by_status: Record<string, number>;
  recent_campaigns: {
    id: number;
    name: string;
    status: string;
    progress_percent: number;
    updated_at: string;
  }[];
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/summary/`, { headers: authHeaders() });
  return handleResponse<DashboardSummary>(res);
}
