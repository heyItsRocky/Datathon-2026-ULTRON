/**
 * Auth store — real JWT authentication against /auth/login.
 * No hardcoded demo user; unauthenticated by default.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiPost, apiGet } from '@/shared/api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'analyst' | 'officer' | 'admin';
  district?: string;
  permissions: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
  clearError: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiPost<{ token: string; user: User; expiresIn: number }>(
            '/auth/login',
            { email, password }
          );
          set({
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Login failed';
          // Axios error with response body
          const apiMsg =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: apiMsg || message,
          });
          return false;
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        // Fire-and-forget server logout
        apiPost('/auth/logout', {}).catch(() => {});
      },

      refresh: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const status = await apiGet<{ authenticated: boolean; user: User | null }>(
            '/auth/status'
          );
          if (status.authenticated && status.user) {
            set({ user: status.user, isAuthenticated: true });
          } else {
            get().logout();
          }
        } catch {
          get().logout();
        }
      },

      hasPermission: (perm: string) => {
        const u = get().user;
        if (!u) return false;
        if (u.permissions.includes('*')) return true;
        return u.permissions.includes(perm);
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'ultron-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// React hook alias (matches useAuthStore usage across app)
export const useAuthStore = authStore;
