export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function extractTocFromHtml(html: string): TocItem[] {
  const items: TocItem[] = [];
  const headingRegex = /<h([23])[^>]*(?:id=["']([^"']+)["'])?[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const text = match[3].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;

    index += 1;
    const id = match[2] || `section-${index}`;
    items.push({ id, text, level });
  }

  return items;
}

export function injectHeadingIds(html: string, toc: TocItem[]): string {
  if (!toc.length) return html;

  let tocIndex = 0;
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    const item = toc[tocIndex];
    if (!item) return full;

    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (text !== item.text) return full;

    tocIndex += 1;
    if (/\bid=/.test(attrs)) {
      return full;
    }
    return `<h${level}${attrs} id="${item.id}">${inner}</h${level}>`;
  });
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
