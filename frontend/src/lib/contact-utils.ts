import type { BusinessHour, SiteSettings } from "@/services/api-hooks";

export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function formatSiteAddress(settings: SiteSettings) {
  return [settings.addressLine1, settings.addressLine2, settings.city, settings.country]
    .filter(Boolean)
    .join(", ");
}

export function mapsHref(settings: SiteSettings) {
  const query = encodeURIComponent(formatSiteAddress(settings));
  return `https://maps.google.com/?q=${query}`;
}

export function weekdayName(date = new Date()) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export function parseBusinessHours(raw: SiteSettings["businessHours"]): BusinessHour[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (row): row is BusinessHour =>
      typeof row === "object" &&
      row !== null &&
      "day" in row &&
      typeof (row as BusinessHour).day === "string",
  );
}

export function isOpenNow(hours: BusinessHour[], date = new Date()) {
  const today = weekdayName(date);
  const row = hours.find((entry) => entry.day.startsWith(today));
  return row ? !row.closed : false;
}

export function weekdayHoursLabel(hours: BusinessHour[]) {
  const weekdays = hours.filter((row) => !row.closed && !row.day.startsWith("Sunday"));
  if (weekdays.length === 0) return "See business hours";
  const first = weekdays[0]?.hours;
  const last = weekdays[weekdays.length - 1]?.hours;
  if (!first) return "See business hours";
  if (first === last) return `Mon–Fri: ${first}`;
  return `Mon–Fri: ${first}`;
}
