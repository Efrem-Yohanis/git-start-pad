import { API_BASE, authFetch, authHeaders, handleResponse, PaginatedResponse } from "./base";

export type ReportFrequency = "10min" | "hourly" | "daily" | "weekly";

export const REPORT_FREQUENCIES: { value: ReportFrequency; label: string }[] = [
  { value: "10min", label: "Every 10 minutes" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

export interface ReportCampaignRef {
  id: number;
  name: string;
}

export interface ReportEmailServiceRef {
  id: number;
  name: string;
}

export interface ReportConfig {
  id: number;
  name: string;
  description: string;
  campaigns: ReportCampaignRef[];
  frequency: ReportFrequency;
  send_to_campaign_owners: boolean;
  recipients: string[];
  email_service: ReportEmailServiceRef | null;
  is_active: boolean;
  last_run_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReportPayload {
  name: string;
  description?: string;
  campaigns?: number[];
  frequency: ReportFrequency;
  send_to_campaign_owners: boolean;
  recipients: string[];
  email_service?: number | null;
  is_active: boolean;
}

export interface ReportActionResult {
  status: string;
  sent?: number;
  reason?: string;
  message?: string;
}

const PATH = "/api/reports/";

export async function fetchReports(params: { page?: number; page_size?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  const res = await authFetch(`${API_BASE}${PATH}${qs.toString() ? `?${qs}` : ""}`, { headers: authHeaders() });
  return handleResponse<PaginatedResponse<ReportConfig>>(res);
}

export async function fetchReport(id: number) {
  const res = await authFetch(`${API_BASE}${PATH}${id}/`, { headers: authHeaders() });
  return handleResponse<ReportConfig>(res);
}

export async function createReport(data: ReportPayload) {
  const res = await authFetch(`${API_BASE}${PATH}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ReportConfig>(res);
}

export async function updateReport(id: number, data: Partial<ReportPayload>) {
  const res = await authFetch(`${API_BASE}${PATH}${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ReportConfig>(res);
}

export async function deleteReport(id: number) {
  const res = await authFetch(`${API_BASE}${PATH}${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

async function action<T>(id: number, name: string) {
  const res = await authFetch(`${API_BASE}${PATH}${id}/${name}/`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<T>(res);
}

export const triggerReport = (id: number) => action<ReportActionResult>(id, "trigger");
export const runReport = (id: number) => action<ReportActionResult>(id, "run");
export const toggleReportStatus = (id: number) => action<ReportConfig>(id, "toggle-status");
