import type { WhrPrediction } from "@/components/health-tools/WomensHealthReminderBox";

const STORAGE_KEY = "whr_reminders";

export type StoredWhrEntry = WhrPrediction & {
  tool: string;
  email: string;
  enabled: boolean;
  createdAt: string;
  status: "scheduled" | "pending" | "cancelled" | "disabled_by_admin";
};

export function loadWhrEntry(toolKey: string): StoredWhrEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, StoredWhrEntry>;
    const entry = db[toolKey];
    return entry?.enabled ? entry : null;
  } catch {
    return null;
  }
}

export function loadWhrEmailCaptured(toolKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, StoredWhrEntry>;
    const email = db[toolKey]?.email?.trim();
    return email || null;
  } catch {
    return null;
  }
}

export function saveWhrEntry(toolKey: string, entry: StoredWhrEntry) {
  if (typeof window === "undefined") return;
  try {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, StoredWhrEntry>;
    db[toolKey] = entry;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore quota errors
  }
}

export function clearWhrEntry(toolKey: string) {
  if (typeof window === "undefined") return;
  try {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, StoredWhrEntry>;
    if (db[toolKey]) {
      db[toolKey] = { ...db[toolKey], enabled: false, status: "cancelled" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  } catch {
    // ignore
  }
}
