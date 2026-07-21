/** Null-safe readers for named form fields (handles conditionally rendered inputs). */

export function formStr(id: string, form: HTMLFormElement): string {
  const el = form.elements.namedItem(id) as HTMLInputElement | HTMLSelectElement | null;
  return el?.value?.trim() ?? "";
}

export function formNum(id: string, form: HTMLFormElement, fallback = 0): number {
  const el = form.elements.namedItem(id) as HTMLInputElement | null;
  if (!el?.value) return fallback;
  const n = Number(el.value);
  return Number.isFinite(n) ? n : fallback;
}

export function formChecked(id: string, form: HTMLFormElement): boolean {
  const el = form.elements.namedItem(id) as HTMLInputElement | null;
  return el?.checked ?? false;
}
