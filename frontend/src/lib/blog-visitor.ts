const VISITOR_KEY = "drinsight-blog-visitor-id";

export function getBlogVisitorKey(): string {
  if (typeof window === "undefined") return "";

  let key = localStorage.getItem(VISITOR_KEY);
  if (!key) {
    key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(VISITOR_KEY, key);
  }

  return key;
}

export function getStoredArticleRating(slug: string): number | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(`blog-rating:${slug}`);
  if (!raw) return null;

  const rating = Number(raw);
  return rating >= 1 && rating <= 5 ? rating : null;
}

export function storeArticleRating(slug: string, rating: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`blog-rating:${slug}`, String(rating));
}
