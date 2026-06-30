"use client";

import { create } from "zustand";

interface PatientUiState {
  mobileMenuOpen: boolean;
  mobileSidebarOpen: boolean;
  toastMessage: string | null;
  toastVisible: boolean;
  consultationModalOpen: boolean;
  reviewModalOpen: boolean;
  reviewRating: number;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  openConsultationModal: () => void;
  closeConsultationModal: () => void;
  openReviewModal: () => void;
  closeReviewModal: () => void;
  setReviewRating: (rating: number) => void;
  resetReviewRating: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const usePatientUiStore = create<PatientUiState>((set) => ({
  mobileMenuOpen: false,
  mobileSidebarOpen: false,
  toastMessage: null,
  toastVisible: false,
  consultationModalOpen: false,
  reviewModalOpen: false,
  reviewRating: 0,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  showToast: (message) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toastMessage: message, toastVisible: true });
    toastTimer = setTimeout(() => {
      set({ toastVisible: false });
      toastTimer = setTimeout(() => set({ toastMessage: null }), 300);
    }, 2800);
  },
  hideToast: () => set({ toastVisible: false, toastMessage: null }),
  openConsultationModal: () => set({ consultationModalOpen: true }),
  closeConsultationModal: () => set({ consultationModalOpen: false }),
  openReviewModal: () => set({ reviewModalOpen: true }),
  closeReviewModal: () => set({ reviewModalOpen: false, reviewRating: 0 }),
  setReviewRating: (rating) => set({ reviewRating: rating }),
  resetReviewRating: () => set({ reviewRating: 0 }),
}));
