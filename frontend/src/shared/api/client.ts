import axios from 'axios';
import { API_BASE_URL, MOCK_MODE } from '@/shared/config';
import { useAuthStore } from '@/stores/authStore';
import { mockFetch } from './mock/handlers';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function apiGet<T>(url: string): Promise<T> {
  if (MOCK_MODE) return mockFetch<T>(url);
  const response = await apiClient.get<T>(url);
  return response.data;
}
