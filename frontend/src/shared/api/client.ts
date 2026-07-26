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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string): Promise<T> {
  if (MOCK_MODE) return mockFetch<T>(url);
  const response = await apiClient.get<T>(url);
  return response.data;
}
