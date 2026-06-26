import { create } from 'zustand';

export type UserRole = 'admin' | 'analyst' | 'officer' | 'viewer';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  permissions: string[];
  district?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshToken: (token: string) => void;
  hasPermission: (permission: string) => boolean;
}

const demoUser: AuthUser = {
  id: 'demo-command',
  name: 'KSP Command Analyst',
  role: 'admin',
  district: 'Bengaluru City',
  permissions: ['*'],
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: demoUser,
  token: 'mock-session-token',
  isAuthenticated: true,
  login: (token, user) => set({ token, user, isAuthenticated: true }),
  logout: () => set({ token: null, user: null, isAuthenticated: false }),
  refreshToken: (token) => set({ token }),
  hasPermission: (permission) => {
    const permissions = get().user?.permissions ?? [];
    return permissions.includes('*') || permissions.includes(permission);
  },
}));
