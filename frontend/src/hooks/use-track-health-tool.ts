"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "di-health-tool-session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useTrackHealthTool() {
  return useCallback((slug: string) => {
    void api
      .post(`/site-admin/public/health-tools/${slug}/usage`, { sessionId: getSessionId() })
      .catch(() => undefined);
  }, []);
}
