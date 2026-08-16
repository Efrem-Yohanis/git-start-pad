import { authFetch, handleResponse, API_BASE, authHeaders } from "./base";
import type { PaginatedResponse } from "./base";

// =============== RESPONSE INTERFACES ===============

export interface ApiMessageContentListItem {
  id: number;
  campaign: number;
  content: Record<string, string>;
  default_language: string;
  languages_available: string[];
  preview: { language: string; preview: string } | null;
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

// =============== API FUNCTIONS ===============

/** GET /api/message-contents/ */
export async function fetchMessageContents(
  page = 1,
  pageSize = 20,
  filters?: Record<string, string>
): Promise<PaginatedResponse<ApiMessageContentListItem>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (filters) Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
  const res = await authFetch(`${API_BASE}/api/message-contents/?${params}`, { headers: authHeaders() });
  return handleResponse<PaginatedResponse<ApiMessageContentListItem>>(res);
}

/** GET /api/message-contents/{id}/ */
export async function fetchMessageContentDetail(id: number): Promise<ApiMessageContentListItem> {
  const res = await authFetch(`${API_BASE}/api/message-contents/${id}/`, { headers: authHeaders() });
  return handleResponse<ApiMessageContentListItem>(res);
}

/** GET /api/message-contents/summary/ */
export async function fetchMessageContentSummary(): Promise<MessageContentSummary> {
  const res = await authFetch(`${API_BASE}/api/message-contents/summary/`, { headers: authHeaders() });
  return handleResponse<MessageContentSummary>(res);
}

/** GET /api/message-contents/supported_languages/ */
export async function fetchSupportedLanguages(): Promise<SupportedLanguagesResponse> {
  const res = await authFetch(`${API_BASE}/api/message-contents/supported_languages/`, { headers: authHeaders() });
  return handleResponse<SupportedLanguagesResponse>(res);
}

/** POST /api/message-contents/ */
export async function createMessageContent(data: {
  campaign: number;
  content: Record<string, string>;
  default_language: string;
}): Promise<ApiMessageContentListItem> {
  const res = await authFetch(`${API_BASE}/api/message-contents/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMessageContentListItem>(res);
}

/** PATCH /api/message-contents/{id}/ */
export async function updateMessageContentById(
  id: number,
  data: { content?: Record<string, string>; default_language?: string }
): Promise<ApiMessageContentListItem> {
  const res = await authFetch(`${API_BASE}/api/message-contents/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMessageContentListItem>(res);
}

/** PUT /api/message-contents/{id}/ */
export async function updateMessageContentFull(
  id: number,
  data: { campaign: number; content: Record<string, string>; default_language: string }
): Promise<ApiMessageContentListItem> {
  const res = await authFetch(`${API_BASE}/api/message-contents/${id}/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ApiMessageContentListItem>(res);
}

/** DELETE /api/message-contents/{id}/ */
export async function deleteMessageContentById(id: number): Promise<void> {
  const res = await authFetch(`${API_BASE}/api/message-contents/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 204) return;
  return handleResponse<void>(res);
}
