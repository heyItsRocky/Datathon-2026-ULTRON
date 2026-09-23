/**
 * Shared API client — Axios instance with mock fallback and envelope unwrapping.
 * When MOCK_MODE=true, requests are intercepted by mock handlers.
 * When MOCK_MODE=false, requests hit the real API (local Flask or Catalyst).
 */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_BASE_URL, MOCK_MODE } from '@/shared/config';
import { mockFetch } from '@/shared/api/mock/handlers';
import { authStore } from '@/stores/authStore';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth token injection
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response envelope unwrapping — backend wraps lists/objects in keys like {cases:[], total}
const LIST_ENVELOPE_KEYS = [
  'cases', 'criminals', 'incidents', 'users', 'logs', 'services', 'models',
  'evidence', 'flows', 'briefs', 'trends', 'zones', 'results', 'routes',
  'pipelines', 'districts', 'threats', 'iocs', 'audit', 'links',
];
const DETAIL_ENVELOPE_KEYS = [
  'case', 'criminal', 'incident', 'user', 'model', 'pipeline', 'threat', 'ioc',
];

function unwrapEnvelope(data: unknown): unknown {
  if (data == null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data;

  // Detail object: {case: {...}} → {...}
  for (const key of DETAIL_ENVELOPE_KEYS) {
    if (key in data && (data as Record<string, unknown>)[key] !== undefined) {
      const inner = (data as Record<string, unknown>)[key];
      if (inner && typeof inner === 'object') return inner;
    }
  }

  // List envelope: {cases: [...], total: N} → [...]
  for (const key of LIST_ENVELOPE_KEYS) {
    const val = (data as Record<string, unknown>)[key];
    if (Array.isArray(val)) return val;
  }

  return data;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Unified request: mockFetch when MOCK_MODE, real API otherwise
async function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  if (MOCK_MODE) {
    const mockData = await mockFetch<T>(config.url || '');
    return mockData;
  }
  const response = await apiClient.request<T>(config);
  return response.data;
}

export const apiGet = <T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> =>
  request<T>({ url, method: 'GET', params });

export const apiPost = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  request<T>({ ...config, url, method: 'POST', data });

export const apiPut = <T = unknown>(url: string, data?: unknown): Promise<T> =>
  request<T>({ url, method: 'PUT', data });

export const apiDelete = <T = unknown>(url: string): Promise<T> =>
  request<T>({ url, method: 'DELETE' });

export { apiClient };
