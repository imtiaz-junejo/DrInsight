"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PendingBookingData {
  spec: string;
  doctorId: string;
  consultType: string;
  selDate: string;
  selTime: string;
  calMonth: number;
  calYear: number;
  currentStep: number;
  billingName: string;
  billingEmail: string;
  billingCountry: string;
  awaitingAuth: boolean;
  savedAt: number;
}

const EMPTY_BOOKING: PendingBookingData = {
  spec: "",
  doctorId: "",
  consultType: "Video Consultation",
  selDate: "",
  selTime: "",
  calMonth: new Date().getMonth(),
  calYear: new Date().getFullYear(),
  currentStep: 2,
  billingName: "",
  billingEmail: "",
  billingCountry: "US",
  awaitingAuth: false,
  savedAt: 0,
};

interface PendingBookingState {
  booking: PendingBookingData | null;
  showRestoredBanner: boolean;
  hasHydrated: boolean;
  saveBooking: (data: Omit<PendingBookingData, "savedAt" | "awaitingAuth"> & { awaitingAuth?: boolean }) => void;
  clearBooking: () => void;
  setAwaitingAuth: (value: boolean) => void;
  setShowRestoredBanner: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  hasPendingBooking: () => boolean;
}

export const usePendingBookingStore = create<PendingBookingState>()(
  persist(
    (set, get) => ({
      booking: null,
      showRestoredBanner: false,
      hasHydrated: false,
      saveBooking: (data) =>
        set({
          booking: {
            ...EMPTY_BOOKING,
            ...data,
            awaitingAuth: data.awaitingAuth ?? true,
            savedAt: Date.now(),
          },
        }),
      clearBooking: () => set({ booking: null, showRestoredBanner: false }),
      setAwaitingAuth: (value) =>
        set((state) =>
          state.booking ? { booking: { ...state.booking, awaitingAuth: value } } : {},
        ),
      setShowRestoredBanner: (value) => set({ showRestoredBanner: value }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      hasPendingBooking: () => {
        const b = get().booking;
        return Boolean(b?.spec && b?.doctorId && b?.selDate && b?.selTime);
      },
    }),
    {
      name: "drinsight-pending-booking",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ booking: state.booking }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
