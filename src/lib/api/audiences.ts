import { authFetch, handleResponse, API_BASE, authHeaders } from "./base";
import type { PaginatedResponse } from "./base";

export interface ApiAudienceListItem {
  id: number;
  campaign: number;
  campaign_info?: {
    id: number;
    name: string;
    status: string;
    execution_status: string;
  };
  total_count: number;
  valid_count: number;
  invalid_count: number;
  valid_percentage: number;
  summary: { total: number; valid: number; invalid: number };
  database_table: string;
  id_field: string;
  filter_condition: string;
  created_at: string;
  updated_at: string;
}

export interface ApiAudienceDetail extends ApiAudienceListItem {
  statistics?: {
    total_recipients: number;
    valid_recipients: number;
    invalid_recipients: number;
    valid_percentage: number;
    invalid_percentage: number;
  };
  database_info?: { table: string; id_field: string; filter: string };
  recipients_preview?: { msisdn: string; lang: string }[];
}

export interface AudienceSummary {
  total_audiences: number;
  total_recipients: number;
  total_valid: number;
  total_invalid: number;
  avg_valid_percentage: number;
  by_campaign_status: Record<string, number>;
}

export interface AudienceStatistics {
  audience_id: number;
  campaign_id: number;
  campaign_name: string;
  total_count: number;
  valid_count: number;
  invalid_count: number;
  valid_percentage: number;
  invalid_percentage: number;
  language_distribution: Record<string, number>;
  invalid_samples: { msisdn: string; lang: string; error: string }[];
  database_table: string;
  id_field: string;
  created_at: string;
  updated_at: string;
}

export interface RecipientsPreview {
  audience_id: number;
  campaign_id: number;
  campaign_name: string;
  total_recipients: number;
  valid_recipients: number;
  invalid_recipients: number;
  preview: { msisdn: string; lang: string }[];
  preview_count: number;
  has_more: boolean;
}

export async function fetchAudiences(page = 1, pageSize = 10, filters?: Record<string, string>) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (filters) Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
  const res = await authFetch(`${API_BASE}/api/audiences/?${params}`, { headers: authHeaders() });
  return handleResponse<PaginatedResponse<ApiAudienceListItem>>(res);
}

export async function fetchAudienceDetail(id: number) {
  const res = await authFetch(`${API_BASE}/api/audiences/${id}/`, { headers: authHeaders() });
  return handleResponse<ApiAudienceDetail>(res);
}

export async function fetchAudienceSummary() {
  const res = await authFetch(`${API_BASE}/api/audiences/summary/`, { headers: authHeaders() });
  return handleResponse<AudienceSummary>(res);
}

export async function fetchAudienceStatistics(id: number) {
  const res = await authFetch(`${API_BASE}/api/audiences/${id}/statistics/`, { headers: authHeaders() });
  return handleResponse<AudienceStatistics>(res);
}

export async function fetchRecipientsPreview(id: number) {
  const res = await authFetch(`${API_BASE}/api/audiences/${id}/recipients_preview/`, { headers: authHeaders() });
  return handleResponse<RecipientsPreview>(res);
}

export async function deleteAudienceById(id: number) {
  const res = await authFetch(`${API_BASE}/api/audiences/${id}/`, { method: "DELETE", headers: authHeaders() });
  return handleResponse<void>(res);
}

export interface AudienceCreatePayload {
  campaign: number;
  database_table: string;
  id_field: string;
  filter_condition?: string;
}

export async function createAudience(payload: AudienceCreatePayload) {
  const res = await authFetch(`${API_BASE}/api/audiences/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<ApiAudienceDetail>(res);
}

export async function updateAudience(id: number, payload: Partial<AudienceCreatePayload>) {
  const res = await authFetch(`${API_BASE}/api/audiences/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<ApiAudienceDetail>(res);
}
