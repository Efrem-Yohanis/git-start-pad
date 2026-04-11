// Re-export base utilities so existing imports from "@/lib/api" still work
export { API_BASE, authHeaders, authFetch, handleResponse } from "./api/base";
export type { PaginatedResponse } from "./api/base";

// Re-export standalone resource APIs
export * from "./api/audiences";
export * from "./api/schedules";
export * from "./api/messages";

const API_BASE_LOCAL = (import.meta.env.VITE_API_BASE_URL || "https://django-app-v6.onrender.com").replace(/\/+$/, "");

// Keep local imports for functions that use the module-level variable
import { authFetch, authHeaders, handleResponse } from "./api/base";

/* -------- Auth -------- */

export async function login(username: string, password: string): Promise<{ access: string; refresh: string }> {
  const res = await fetch(`${API_BASE_LOCAL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  const res = await fetch(`${API_BASE_LOCAL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  return handleResponse(res);
}

/* -------- Campaigns -------- */

export interface ApiProgress {
  total_messages: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  pending_count: number;
  progress_percent: number;
  status: string;
}

export interface ApiCampaign {
  id: number;
  name: string;
  status: string;
  execution_status: string;
  execution_status_display: string;
  sender_id: string;
  channels: Record<string, string> | string[];
  created_by: number;
  created_at: string;
  updated_at: string;
  schedule: {
    id: number;
    campaign_name: string;
    schedule_type: string;
    schedule_type_display: string;
    campaign_status: string;
    campaign_status_display: string;
    current_window_status_display: string;
    upcoming_windows: string;
    schedule_summary: string;
    start_date: string;
    end_date: string | null;
    run_days: Record<string, string> | number[];
    time_windows: Record<string, string> | { start: string; end: string }[];
    timezone: string;
    current_round: number;
    current_window_date: string | null;
    current_window_index: number;
    current_window_status: string;
    next_run_date: string | null;
    next_run_window: number;
    completed_windows: Record<string, string>;
    total_windows_completed: number;
    is_active: boolean;
    auto_reset: boolean;
    created_at: string;
    updated_at: string;
    last_processed_at: string | null;
  } | null;
  message_content: {
    id: number;
    languages_available: string[] | string;
    preview: string | { language: string; preview: string } | null;
    content: Record<string, string>;
    default_language: string;
    created_at: string;
    updated_at: string;
  } | null;
  audience: {
    id: number;
    summary: string | { total: number; valid: number; invalid: number };
    database_info: string | { table: string; id_field: string; filter: string };
    valid_percentage: string | number;
    total_count: number;
    valid_count: number;
    invalid_count: number;
    database_table: string;
    id_field: string;
    filter_condition: string;
    created_at: string;
    updated_at: string;
  } | null;
  progress: ApiProgress | string;
  checkpoint_info: Record<string, unknown> | string;
  provider_stats: Record<string, unknown> | string;
  last_processed_id: number;
  total_processed: number;
  can_start: boolean;
  can_pause: boolean;
  can_resume: boolean;
  can_stop: boolean;
  can_complete: boolean;
  is_deleted: boolean;
}

export async function fetchCampaigns(page = 1, pageSize = 10) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/?page=${page}&page_size=${pageSize}`, {
    headers: authHeaders(),
  });
  return handleResponse<import("./api/base").PaginatedResponse<ApiCampaign>>(res);
}

export async function fetchCampaign(id: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/`, { headers: authHeaders() });
  return handleResponse<ApiCampaign>(res);
}

export interface CreateCampaignPayload {
  name: string;
  sender_id: string;
  channels: string[];
  status: string;
}

export async function createCampaign(data: CreateCampaignPayload) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<{ id: number; [key: string]: unknown }>(res);
}

export async function updateCampaignApi(id: number, data: Partial<CreateCampaignPayload>) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiCampaign>(res);
}

export async function deleteCampaignApi(id: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

export async function softDeleteCampaign(id: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/soft_delete/`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<{ message: string; campaign_id: number }>(res);
}

/* -------- Campaign Actions -------- */

export async function startCampaign(id: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/start/`, { method: "POST", headers: authHeaders() });
  return handleResponse<{ status: string; message: string; campaign_id: number }>(res);
}

export async function pauseCampaign(id: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/pause/`, { method: "POST", headers: authHeaders() });
  return handleResponse<{ status: string; execution_status: string; message: string; campaign_id: number }>(res);
}

export async function resumeCampaign(id: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/resume/`, { method: "POST", headers: authHeaders() });
  return handleResponse<{ status: string; execution_status: string; message: string; campaign_id: number }>(res);
}

export async function stopCampaign(id: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/stop/`, { method: "POST", headers: authHeaders() });
  return handleResponse<{ status: string; message: string; campaign_id: number }>(res);
}

export async function completeCampaign(id: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/complete/`, { method: "POST", headers: authHeaders() });
  return handleResponse<{ status: string; execution_status: string; message: string; campaign_id: number }>(res);
}

export async function archiveCampaign(id: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${id}/archive/`, { method: "POST", headers: authHeaders() });
  return handleResponse<{ status: string; message: string; campaign_id: number }>(res);
}

/* -------- Schedule (campaign-nested) -------- */

export interface SchedulePayload {
  schedule_type: string;
  start_date: string;
  end_date?: string;
  run_days?: number[];
  time_windows: { start: string; end: string }[];
  timezone: string;
  auto_reset: boolean;
}

export async function fetchSchedule(campaignId: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/schedule/`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createSchedule(campaignId: number, data: SchedulePayload) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/schedule/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateSchedule(campaignId: number, data: Partial<SchedulePayload>) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/schedule/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteSchedule(campaignId: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/schedule/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

/* -------- Message Content (campaign-nested) -------- */

export interface MessageContentPayload {
  content: Record<string, string>;
  default_language: string;
}

export async function fetchMessageContent(campaignId: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/message-content/`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function updateMessageContent(campaignId: number, data: MessageContentPayload) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/message-content/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function patchMessageContent(campaignId: number, data: Partial<MessageContentPayload>) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/message-content/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/* -------- Audience (campaign-nested) -------- */

export interface AudiencePayload {
  recipients: { msisdn: string; lang: string; variables?: Record<string, string> }[];
}

export async function fetchAudience(campaignId: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/audience/`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createAudience(campaignId: number, data: AudiencePayload) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/audience/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateAudience(campaignId: number, data: AudiencePayload) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/audience/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteAudience(campaignId: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/audience/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

/* -------- Progress & Batches -------- */

export async function fetchCampaignProgress(campaignId: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/progress/`, { headers: authHeaders() });
  return handleResponse<{
    campaign_id: number;
    campaign_name: string;
    progress: ApiProgress;
    batches: { total_batches: number; completed_batches: number; failed_batches: number; in_progress_batches: number };
  }>(res);
}

export async function fetchCampaignBatches(campaignId: number, status?: string) {
  const params = status ? `?status=${status}` : "";
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/batches/${params}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchCampaignCheckpoint(campaignId: number) {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/${campaignId}/checkpoint/`, { headers: authHeaders() });
  return handleResponse(res);
}

/* -------- Utility -------- */

export async function fetchChannelChoices() {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/channel-choices/`, { headers: authHeaders() });
  return handleResponse<{ value: string; display: string }[]>(res);
}

export async function fetchExecutionStatusChoices() {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/execution-status-choices/`, { headers: authHeaders() });
  return handleResponse<{ value: string; display: string }[]>(res);
}

export async function fetchCampaignSummary() {
  const res = await authFetch(`${API_BASE_LOCAL}/api/campaigns/summary/`, { headers: authHeaders() });
  return handleResponse(res);
}
