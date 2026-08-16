import { authFetch, handleResponse, API_BASE, authHeaders } from "./base";
import type { PaginatedResponse } from "./base";

// =============== RESPONSE INTERFACES ===============

export interface TimeWindow {
  start: string;
  end: string;
}

export interface UpcomingWindow {
  date: string;
  windows: number[];
  type: string;
  day_name?: string;
}

export interface CompletedWindow {
  date: string;
  window: number;
  status: string;
  completed_at: string;
  stats?: Record<string, unknown>;
}

export interface ApiScheduleListItem {
  id: number;
  campaign: number;
  campaign_name: string;
  schedule_type: string;
  schedule_type_display: string;
  campaign_status: string;
  campaign_status_display: string;
  current_window_status: string;
  current_window_status_display: string;
  schedule_summary: string;
  upcoming_windows: UpcomingWindow[];
  start_date: string;
  end_date: string | null;
  run_days: number[];
  time_windows: TimeWindow[];
  timezone: string;
  current_round: number;
  current_window_date: string | null;
  current_window_index: number;
  next_run_date: string | null;
  next_run_window: number | null;
  completed_windows: CompletedWindow[];
  total_windows_completed: number;
  is_active: boolean;
  auto_reset: boolean;
  created_at: string;
  updated_at: string;
  last_processed_at: string | null;
}

export interface ApiScheduleDetail extends ApiScheduleListItem {}

export interface ScheduleSummary {
  total_schedules: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  by_window_status: Record<string, number>;
  active_schedules: number;
  inactive_schedules: number;
  running_today: number;
}

export interface ScheduleTypeOption {
  value: string;
  display: string;
}

// =============== REQUEST INTERFACES ===============

export interface ScheduleCreatePayload {
  campaign: number;
  schedule_type: string;
  start_date: string;
  end_date?: string | null;
  run_days?: number[];
  time_windows: TimeWindow[];
  timezone?: string;
  auto_reset?: boolean;
}

export interface ScheduleUpdatePayload {
  schedule_type?: string;
  start_date?: string;
  end_date?: string | null;
  run_days?: number[];
  time_windows?: TimeWindow[];
  timezone?: string;
  auto_reset?: boolean;
  is_active?: boolean;
}

// =============== API FUNCTIONS ===============

/**
 * List all schedules
 * GET /api/schedules/
 */
export async function fetchSchedules(page = 1, pageSize = 10, filters?: Record<string, string>) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (filters) Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
  const res = await authFetch(`${API_BASE}/api/schedules/?${params}`, { headers: authHeaders() });
  return handleResponse<PaginatedResponse<ApiScheduleListItem>>(res);
}

/**
 * Get schedule detail
 * GET /api/schedules/{id}/
 */
export async function fetchScheduleDetail(id: number) {
  const res = await authFetch(`${API_BASE}/api/schedules/${id}/`, { headers: authHeaders() });
  return handleResponse<ApiScheduleDetail>(res);
}

/**
 * Get schedule summary
 * GET /api/schedules/summary/
 */
export async function fetchScheduleSummary() {
  const res = await authFetch(`${API_BASE}/api/schedules/summary/`, { headers: authHeaders() });
  return handleResponse<ScheduleSummary>(res);
}

/**
 * Get schedule type options (static, defined in model)
 */
export async function fetchScheduleTypes(): Promise<ScheduleTypeOption[]> {
  return [
    { value: "once", display: "One Time" },
    { value: "daily", display: "Daily" },
    { value: "weekly", display: "Weekly" },
    { value: "monthly", display: "Monthly" },
  ];
}

/**
 * Get upcoming windows for a schedule
 * GET /api/schedules/{id}/upcoming_windows/
 */
export async function fetchUpcomingWindows(id: number, limit = 5) {
  const res = await authFetch(`${API_BASE}/api/schedules/${id}/upcoming_windows/?limit=${limit}`, { headers: authHeaders() });
  return handleResponse<UpcomingWindow[]>(res);
}

/**
 * Create schedule
 * POST /api/schedules/
 */
export async function createSchedule(data: ScheduleCreatePayload) {
  const payload: Record<string, unknown> = {
    campaign: data.campaign,
    schedule_type: data.schedule_type,
    start_date: data.start_date,
    end_date: data.end_date || null,
    time_windows: data.time_windows,
    timezone: data.timezone || "UTC",
    auto_reset: data.auto_reset !== undefined ? data.auto_reset : true,
  };
  if (data.schedule_type === "weekly" && data.run_days) {
    payload.run_days = data.run_days;
  }
  const res = await authFetch(`${API_BASE}/api/schedules/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<ApiScheduleDetail>(res);
}

/**
 * Partial update schedule
 * PATCH /api/schedules/{id}/
 */
export async function updateScheduleById(id: number, data: ScheduleUpdatePayload | Record<string, unknown>) {
  const res = await authFetch(`${API_BASE}/api/schedules/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiScheduleDetail>(res);
}

/**
 * Full update schedule
 * PUT /api/schedules/{id}/
 */
export async function updateScheduleFull(id: number, data: ScheduleCreatePayload) {
  const payload: Record<string, unknown> = {
    campaign: data.campaign,
    schedule_type: data.schedule_type,
    start_date: data.start_date,
    end_date: data.end_date || null,
    time_windows: data.time_windows,
    timezone: data.timezone || "UTC",
    auto_reset: data.auto_reset !== undefined ? data.auto_reset : true,
  };
  if (data.schedule_type === "weekly" && data.run_days) {
    payload.run_days = data.run_days;
  }
  const res = await authFetch(`${API_BASE}/api/schedules/${id}/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<ApiScheduleDetail>(res);
}

/**
 * Delete schedule
 * DELETE /api/schedules/{id}/
 */
export async function deleteScheduleById(id: number) {
  const res = await authFetch(`${API_BASE}/api/schedules/${id}/`, { method: "DELETE", headers: authHeaders() });
  return handleResponse<void>(res);
}

/**
 * Activate schedule
 * POST /api/schedules/{id}/activate/
 */
export async function activateSchedule(id: number) {
  const res = await authFetch(`${API_BASE}/api/schedules/${id}/activate/`, { method: "POST", headers: authHeaders() });
  return handleResponse<{ detail: string; is_active: boolean }>(res);
}

/**
 * Deactivate schedule
 * POST /api/schedules/{id}/deactivate/
 */
export async function deactivateSchedule(id: number) {
  const res = await authFetch(`${API_BASE}/api/schedules/${id}/deactivate/`, { method: "POST", headers: authHeaders() });
  return handleResponse<{ detail: string; is_active: boolean }>(res);
}

/**
 * Reset schedule
 * POST /api/schedules/{id}/reset/
 */
export async function resetSchedule(id: number) {
  const res = await authFetch(`${API_BASE}/api/schedules/${id}/reset/`, { method: "POST", headers: authHeaders() });
  return handleResponse(res);
}
