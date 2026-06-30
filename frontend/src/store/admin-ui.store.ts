"use client";

import { create } from "zustand";

interface AdminUiState {
  sidebarOpen: boolean;
  toastMessage: string | null;
  toastVisible: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useAdminUiStore = create<AdminUiState>((set) => ({
  sidebarOpen: false,
  toastMessage: null,
  toastVisible: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toastMessage: message, toastVisible: true });
    toastTimer = setTimeout(() => {
      set({ toastVisible: false });
      toastTimer = setTimeout(() => set({ toastMessage: null }), 300);
    }, 2400);
  },
  hideToast: () => set({ toastVisible: false, toastMessage: null }),
}));
