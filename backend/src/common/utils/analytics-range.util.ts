export type AnalyticsRangeKey = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface AnalyticsRange {
  key: AnalyticsRangeKey;
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
}

export function resolveAnalyticsRange(query: {
  range?: string;
  from?: string;
  to?: string;
}): AnalyticsRange {
  const key = (query.range as AnalyticsRangeKey) || 'month';
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start: Date;

  if (key === 'today') {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
  } else if (key === 'week') {
    start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (key === 'year') {
    start = new Date(now.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);
  } else if (key === 'custom' && query.from) {
    start = new Date(query.from);
    start.setHours(0, 0, 0, 0);
    if (query.to) {
      const customEnd = new Date(query.to);
      customEnd.setHours(23, 59, 59, 999);
      if (!Number.isNaN(customEnd.getTime())) {
        end.setTime(customEnd.getTime());
      }
    }
  } else {
    start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }

  if (Number.isNaN(start.getTime())) {
    start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }

  const periodMs = Math.max(end.getTime() - start.getTime(), 24 * 60 * 60 * 1000);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - periodMs);

  return { key, start, end, prevStart, prevEnd };
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function trendTagClass(change: number, invert = false): string {
  const positive = invert ? change <= 0 : change >= 0;
  if (change === 0) return 'tt-b';
  return positive ? 'tt-g' : 'tt-r';
}
