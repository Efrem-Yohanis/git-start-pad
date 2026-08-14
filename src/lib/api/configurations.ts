import { API_BASE, authFetch, authHeaders, handleResponse, PaginatedResponse } from "./base";

/* -------- Types -------- */

export interface LanguageConfig {
  id: number;
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChannelConfig {
  id: number;
  code: string;
  name: string;
  description: string;
  channel_type: string;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DataSourceConfig {
  id: number;
  name: string;
  database_type: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password?: string;
  ssl_required: boolean;
  extra_options?: Record<string, unknown>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SenderIDConfig {
  id: number;
  sender_id: string;
  name: string;
  channel: number | null;
  channel_name?: string;
  data_source: number | null;
  provider_name: string;
  provider_url: string;
  api_key?: string;
  username: string;
  password?: string;
  is_default: boolean;
  is_active: boolean;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailServiceConfig {
  id: number;
  name: string;
  smtp_host: string;
  smtp_port: number;
  use_tls: boolean;
  use_ssl: boolean;
  username: string;
  password?: string;
  sender_email: string;
  sender_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TestConnectionResult {
  status: "ok" | "error" | string;
  message?: string;
}

/* -------- Generic CRUD helpers -------- */

async function crudList<T>(path: string) {
  const res = await authFetch(`${API_BASE}${path}`, { headers: authHeaders() });
  return handleResponse<PaginatedResponse<T>>(res);
}

async function crudGet<T>(path: string, id: number) {
  const res = await authFetch(`${API_BASE}${path}${id}/`, { headers: authHeaders() });
  return handleResponse<T>(res);
}

async function crudCreate<T>(path: string, data: Partial<T>) {
  const res = await authFetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<T>(res);
}

async function crudPatch<T>(path: string, id: number, data: Partial<T>) {
  const res = await authFetch(`${API_BASE}${path}${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<T>(res);
}

async function crudPut<T>(path: string, id: number, data: Partial<T>) {
  const res = await authFetch(`${API_BASE}${path}${id}/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<T>(res);
}

async function crudDelete(path: string, id: number) {
  const res = await authFetch(`${API_BASE}${path}${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

async function postAction<T>(path: string, id: number, action: string) {
  const res = await authFetch(`${API_BASE}${path}${id}/${action}/`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse<T>(res);
}

/* -------- Languages -------- */
const LANG_PATH = "/api/languages/";
export const fetchLanguages = () => crudList<LanguageConfig>(LANG_PATH);
export const fetchLanguage = (id: number) => crudGet<LanguageConfig>(LANG_PATH, id);
export const createLanguage = (d: Partial<LanguageConfig>) => crudCreate<LanguageConfig>(LANG_PATH, d);
export const updateLanguage = (id: number, d: Partial<LanguageConfig>) => crudPatch<LanguageConfig>(LANG_PATH, id, d);
export const replaceLanguage = (id: number, d: Partial<LanguageConfig>) => crudPut<LanguageConfig>(LANG_PATH, id, d);
export const deleteLanguage = (id: number) => crudDelete(LANG_PATH, id);
export const toggleLanguage = (id: number) => postAction<LanguageConfig>(LANG_PATH, id, "toggle-status");

/* -------- Channels -------- */
const CHAN_PATH = "/api/channels/";
export const fetchChannels = () => crudList<ChannelConfig>(CHAN_PATH);
export const fetchChannel = (id: number) => crudGet<ChannelConfig>(CHAN_PATH, id);
export const createChannel = (d: Partial<ChannelConfig>) => crudCreate<ChannelConfig>(CHAN_PATH, d);
export const updateChannel = (id: number, d: Partial<ChannelConfig>) => crudPatch<ChannelConfig>(CHAN_PATH, id, d);
export const deleteChannel = (id: number) => crudDelete(CHAN_PATH, id);
export const toggleChannel = (id: number) => postAction<ChannelConfig>(CHAN_PATH, id, "toggle-status");

/* -------- Data Sources -------- */
const DS_PATH = "/api/data-sources/";
export const fetchDataSources = () => crudList<DataSourceConfig>(DS_PATH);
export const fetchDataSource = (id: number) => crudGet<DataSourceConfig>(DS_PATH, id);
export const createDataSource = (d: Partial<DataSourceConfig>) => crudCreate<DataSourceConfig>(DS_PATH, d);
export const updateDataSource = (id: number, d: Partial<DataSourceConfig>) => crudPatch<DataSourceConfig>(DS_PATH, id, d);
export const deleteDataSource = (id: number) => crudDelete(DS_PATH, id);
export const testDataSource = (id: number) => postAction<TestConnectionResult>(DS_PATH, id, "test-connection");

/* -------- Sender IDs -------- */
const SENDER_PATH = "/api/sender-ids/";
export const fetchSenderIds = () => crudList<SenderIDConfig>(SENDER_PATH);
export const fetchSenderId = (id: number) => crudGet<SenderIDConfig>(SENDER_PATH, id);
export const createSenderId = (d: Partial<SenderIDConfig>) => crudCreate<SenderIDConfig>(SENDER_PATH, d);
export const updateSenderId = (id: number, d: Partial<SenderIDConfig>) => crudPatch<SenderIDConfig>(SENDER_PATH, id, d);
export const deleteSenderId = (id: number) => crudDelete(SENDER_PATH, id);
export const testSenderId = (id: number) => postAction<TestConnectionResult>(SENDER_PATH, id, "test-connection");

/* -------- Email Services -------- */
const EMAIL_PATH = "/api/email-services/";
export const fetchEmailServices = () => crudList<EmailServiceConfig>(EMAIL_PATH);
export const fetchEmailService = (id: number) => crudGet<EmailServiceConfig>(EMAIL_PATH, id);
export const createEmailService = (d: Partial<EmailServiceConfig>) => crudCreate<EmailServiceConfig>(EMAIL_PATH, d);
export const updateEmailService = (id: number, d: Partial<EmailServiceConfig>) => crudPatch<EmailServiceConfig>(EMAIL_PATH, id, d);
export const deleteEmailService = (id: number) => crudDelete(EMAIL_PATH, id);
export const testEmailService = (id: number) => postAction<TestConnectionResult>(EMAIL_PATH, id, "test-connection");
