import axios from 'axios';

export interface NormalizedApiError {
  message: string;
  status?: number;
  code?: string;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    return { message: error.response?.statusText || error.message, status: error.response?.status, code: error.code };
  }
  if (error instanceof Error) return { message: error.message };
  return { message: 'Unknown API error' };
}
