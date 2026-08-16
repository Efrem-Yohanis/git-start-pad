import { API_BASE, authFetch, authHeaders, handleResponse } from "./base";

/* -------- Types -------- */

export interface SupportedLanguage {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface SupportedChannel {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  priority: number;
  created_at?: string;
}

export interface DatabaseConfig {
  id: number;
  name: string;
  connection_type: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password?: string;
  is_active: boolean;
  created_at?: string;
}

export interface SenderIdConfig {
  id: number;
  sender_id: string;
  description: string;
  country_code: string;
  is_active: boolean;
  is_verified: boolean;
  channel: number;
  channel_name?: string;
  created_at?: string;
}

export interface RouterConfig {
  id: number;
  name: string;
  isp_name: string;
  provider: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  priority: number;
  weight: number;
  channel: number;
  channel_name?: string;
  rate_per_message: string;
  currency: string;
  is_active: boolean;
  is_default: boolean;
  supports_dlr: boolean;
  max_concatenated: number;
  created_at?: string;
}

/* -------- Generic CRUD helper -------- */

async function crudList<T>(path: string) {
  const res = await authFetch(`${API_BASE}${path}`, { headers: authHeaders() });
  return handleResponse<{ results: T[] }>(res);
}

async function crudCreate<T>(path: string, data: Partial<T>) {
  const res = await authFetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<T>(res);
}

async function crudUpdate<T>(path: string, id: number, data: Partial<T>) {
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

/* -------- Languages -------- */
const LANG_PATH = "/api/supported-languages/";
export const fetchLanguages = () => crudList<SupportedLanguage>(LANG_PATH);
export const createLanguage = (d: Partial<SupportedLanguage>) => crudCreate<SupportedLanguage>(LANG_PATH, d);
export const updateLanguage = (id: number, d: Partial<SupportedLanguage>) => crudUpdate<SupportedLanguage>(LANG_PATH, id, d);
export const deleteLanguage = (id: number) => crudDelete(LANG_PATH, id);

/* -------- Channels -------- */
const CHAN_PATH = "/api/supported-channels/";
export const fetchChannels = () => crudList<SupportedChannel>(CHAN_PATH);
export const createChannel = (d: Partial<SupportedChannel>) => crudCreate<SupportedChannel>(CHAN_PATH, d);
export const updateChannel = (id: number, d: Partial<SupportedChannel>) => crudUpdate<SupportedChannel>(CHAN_PATH, id, d);
export const deleteChannel = (id: number) => crudDelete(CHAN_PATH, id);

/* -------- DB Configs -------- */
const DB_PATH = "/api/database-configs/";
export const fetchDbConfigs = () => crudList<DatabaseConfig>(DB_PATH);
export const createDbConfig = (d: Partial<DatabaseConfig>) => crudCreate<DatabaseConfig>(DB_PATH, d);
export const updateDbConfig = (id: number, d: Partial<DatabaseConfig>) => crudUpdate<DatabaseConfig>(DB_PATH, id, d);
export const deleteDbConfig = (id: number) => crudDelete(DB_PATH, id);

/* -------- Sender IDs -------- */
const SENDER_PATH = "/api/sender-ids/";
export const fetchSenderIds = () => crudList<SenderIdConfig>(SENDER_PATH);
export const createSenderId = (d: Partial<SenderIdConfig>) => crudCreate<SenderIdConfig>(SENDER_PATH, d);
export const updateSenderId = (id: number, d: Partial<SenderIdConfig>) => crudUpdate<SenderIdConfig>(SENDER_PATH, id, d);
export const deleteSenderId = (id: number) => crudDelete(SENDER_PATH, id);

/* -------- Router Configs -------- */
const ROUTER_PATH = "/api/router-configs/";
export const fetchRouterConfigs = () => crudList<RouterConfig>(ROUTER_PATH);
export const createRouterConfig = (d: Partial<RouterConfig>) => crudCreate<RouterConfig>(ROUTER_PATH, d);
export const updateRouterConfig = (id: number, d: Partial<RouterConfig>) => crudUpdate<RouterConfig>(ROUTER_PATH, id, d);
export const deleteRouterConfig = (id: number) => crudDelete(ROUTER_PATH, id);
