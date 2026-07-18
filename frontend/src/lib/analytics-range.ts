export type AnalyticsRangeKey = "today" | "week" | "month" | "year" | "custom";

export interface AnalyticsRangeParams {
  range: AnalyticsRangeKey;
  from?: string;
  to?: string;
}

export const ANALYTICS_RANGE_OPTIONS = [
  "Today",
  "This Week",
  "This Month",
  "This Year",
  "Custom",
] as const;

export function rangeKeyFromIndex(index: number): AnalyticsRangeKey {
  const keys: AnalyticsRangeKey[] = ["today", "week", "month", "year", "custom"];
  return keys[index] ?? "month";
}

export function rangeIndexFromKey(key: AnalyticsRangeKey): number {
  const keys: AnalyticsRangeKey[] = ["today", "week", "month", "year", "custom"];
  return Math.max(0, keys.indexOf(key));
}

export function buildAnalyticsQuery(params: AnalyticsRangeParams): Record<string, string> {
  const query: Record<string, string> = { range: params.range };
  if (params.range === "custom" && params.from) query.from = params.from;
  if (params.range === "custom" && params.to) query.to = params.to;
  return query;
}

export function exportTableCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
