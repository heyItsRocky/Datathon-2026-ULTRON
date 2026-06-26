import { create } from 'zustand';

export type Theme = 'dark';

export interface RightPanelState {
  open: boolean;
  title?: string;
  content?: string;
}

export interface ModalEntry {
  id: string;
  title: string;
}

export interface ToastEntry {
  id: string;
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

interface UiState {
  theme: Theme;
  rightPanel: RightPanelState;
  modalStack: ModalEntry[];
  toasts: ToastEntry[];
  openRightPanel: (panel: Omit<RightPanelState, 'open'>) => void;
  closeRightPanel: () => void;
  pushModal: (modal: ModalEntry) => void;
  popModal: () => void;
  addToast: (toast: Omit<ToastEntry, 'id'> & { id?: string }) => string;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'dark',
  rightPanel: { open: false },
  modalStack: [],
  toasts: [],
  openRightPanel: (panel) => set({ rightPanel: { open: true, ...panel } }),
  closeRightPanel: () => set({ rightPanel: { open: false } }),
  pushModal: (modal) => set((state) => ({ modalStack: [...state.modalStack, modal] })),
  popModal: () => set((state) => ({ modalStack: state.modalStack.slice(0, -1) })),
  addToast: (toast) => {
    const id = toast.id ?? crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
