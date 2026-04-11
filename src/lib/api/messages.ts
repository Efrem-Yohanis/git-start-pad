import { authFetch, handleResponse, API_BASE, authHeaders } from "./base";
import type { PaginatedResponse } from "./base";

export interface ApiMessageContentListItem {
  id: number;
  campaign: number;
  campaign_info?: {
    id: number;
    name: string;
    status: string;
    execution_status: string;
  };
  content: Record<string, string>;
  default_language: string;
  languages_available: string[];
  preview: { language: string; preview: string } | null;
  language_completeness?: {
    total_languages: number;
    languages_with_content: number;
    languages_missing_content: number;
    present_languages: string[];
    missing_languages: string[];
    completeness_percentage: number;
  };
  content_preview?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface MessageContentSummary {
  total_message_contents: number;
  by_default_language: Record<string, number>;
  total_languages_used: Record<string, number>;
  content_completeness: Record<string, number>;
}

export interface SupportedLanguage {
  code: string;
  name: string;
}

export interface SupportedLanguagesResponse {
  languages: SupportedLanguage[];
  default: string;
}

export interface RenderPreviewResponse {
  campaign_id: number;
  campaign_name: string;
  language: string;
  original_template: string;
  rendered_message: string;
  variables_used: Record<string, string>;
  character_count: number;
  sms_segments: number;
}

export async function fetchMessageContents(page = 1, pageSize = 10, filters?: Record<string, string>) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (filters) Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
  const res = await authFetch(`${API_BASE}/api/message-contents/?${params}`, { headers: authHeaders() });
  return handleResponse<PaginatedResponse<ApiMessageContentListItem>>(res);
}

export async function fetchMessageContentDetail(id: number) {
  const res = await authFetch(`${API_BASE}/api/message-contents/${id}/`, { headers: authHeaders() });
  return handleResponse<ApiMessageContentListItem>(res);
}

export async function fetchMessageContentSummary() {
  const res = await authFetch(`${API_BASE}/api/message-contents/summary/`, { headers: authHeaders() });
  return handleResponse<MessageContentSummary>(res);
}

export async function fetchSupportedLanguages() {
  const res = await authFetch(`${API_BASE}/api/message-contents/supported_languages/`, { headers: authHeaders() });
  return handleResponse<SupportedLanguagesResponse>(res);
}

export async function createMessageContent(data: { campaign: number; content: Record<string, string>; default_language: string }) {
  const res = await authFetch(`${API_BASE}/api/message-contents/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMessageContentListItem>(res);
}

export async function updateMessageContentById(id: number, data: Record<string, unknown>) {
  const res = await authFetch(`${API_BASE}/api/message-contents/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMessageContentListItem>(res);
}

export async function updateMessageContentFull(id: number, data: { campaign: number; content: Record<string, string>; default_language: string }) {
  const res = await authFetch(`${API_BASE}/api/message-contents/${id}/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMessageContentListItem>(res);
}

export async function deleteMessageContentById(id: number) {
  const res = await authFetch(`${API_BASE}/api/message-contents/${id}/`, { method: "DELETE", headers: authHeaders() });
  return handleResponse<void>(res);
}

export async function renderMessagePreview(id: number, language?: string, variables?: Record<string, string>) {
  const params = new URLSearchParams();
  if (language) params.set("language", language);
  if (variables) params.set("variables", JSON.stringify(variables));
  const res = await authFetch(`${API_BASE}/api/message-contents/${id}/render_preview/?${params}`, { headers: authHeaders() });
  return handleResponse<RenderPreviewResponse>(res);
}
