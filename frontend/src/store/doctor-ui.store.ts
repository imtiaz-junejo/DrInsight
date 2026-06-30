"use client";

import { create } from "zustand";

export type DoctorAvailability = "online" | "busy" | "off";

export interface PatientModalData {
  initials: string;
  name: string;
  age: string;
  gender: "M" | "F";
  diagnosis: string;
  status: "Critical" | "Active" | "Follow-up" | "New";
  avatarBg: string;
}

interface DoctorUiState {
  mobileMenuOpen: boolean;
  mobileSidebarOpen: boolean;
  toastMessage: string | null;
  toastVisible: boolean;
  availability: DoctorAvailability;
  patientModal: PatientModalData | null;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  setAvailability: (value: DoctorAvailability) => void;
  openPatientModal: (data: PatientModalData) => void;
  closePatientModal: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useDoctorUiStore = create<DoctorUiState>((set) => ({
  mobileMenuOpen: false,
  mobileSidebarOpen: false,
  toastMessage: null,
  toastVisible: false,
  availability: "online",
  patientModal: null,
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
  setAvailability: (value) => set({ availability: value }),
  openPatientModal: (data) => set({ patientModal: data }),
  closePatientModal: () => set({ patientModal: null }),
}));
