import { create } from 'zustand';

export interface Breadcrumb {
  label: string;
  path?: string;
}

interface NavState {
  activeSection: string;
  sidebarCollapsed: boolean;
  breadcrumbs: Breadcrumb[];
  history: string[];
  navigateTo: (path: string, section?: string) => void;
  toggleSidebar: () => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  goBack: () => string | undefined;
}

export const useNavStore = create<NavState>((set, get) => ({
  activeSection: 'command',
  sidebarCollapsed: false,
  breadcrumbs: [{ label: 'Command Center', path: '/' }],
  history: [],
  navigateTo: (path, section) =>
    set((state) => ({
      activeSection: section ?? state.activeSection,
      history: [...state.history, path],
    })),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  goBack: () => {
    const history = get().history;
    const previous = history.at(-2);
    set({ history: history.slice(0, -1) });
    return previous;
  },
}));
