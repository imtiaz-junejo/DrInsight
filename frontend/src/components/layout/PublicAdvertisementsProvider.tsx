"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  usePublicAdvertisements,
  type AdvertisementSettings,
} from "@/services/configuration-api-hooks";

const PublicAdvertisementsContext = createContext<AdvertisementSettings | undefined>(undefined);

export function PublicAdvertisementsProvider({ children }: { children: ReactNode }) {
  const adsQuery = usePublicAdvertisements();
  return (
    <PublicAdvertisementsContext.Provider value={adsQuery.data}>
      {children}
    </PublicAdvertisementsContext.Provider>
  );
}

export function usePublicAdvertisementsData() {
  return useContext(PublicAdvertisementsContext);
}
