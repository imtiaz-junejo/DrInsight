import type { CSSProperties } from "react";
import type { BlogCategory, BlogPost } from "@/services/api-hooks";

export type CategoryGroup = "clinical" | "surgical" | "diagnostic" | "other";

export type BlogCategoryVisuals = {
  emoji: string;
  thumbBg: string;
  iconBg: string;
  badgeBg: string;
  catColor: string;
  hoverColor: string;
  group: CategoryGroup;
  specTagClass: "clinical" | "surgical" | "other";
  sortIndex: number;
};

type SpecialtyDefinition = {
  match: RegExp;
  emoji: string;
  thumbBg: string;
  iconBg: string;
  badgeBg: string;
  catColor: string;
  hoverColor: string;
  group: CategoryGroup;
};

const DEFAULT_EMOJI = "🩺";

const DEFAULT_VISUALS: Omit<BlogCategoryVisuals, "sortIndex"> = {
  emoji: DEFAULT_EMOJI,
  thumbBg: "#f0f7ff",
  iconBg: "#f0f7ff",
  badgeBg: "#1a56a0",
  catColor: "#1a56a0",
  hoverColor: "#0f3d7a",
  group: "clinical",
  specTagClass: "clinical",
};

/** Emoji icons and colors aligned with blog_page.html reference */
const SPECIALTY_DEFINITIONS: SpecialtyDefinition[] = [
  {
    match: /cardio|heart/i,
    emoji: "❤️",
    thumbBg: "#fef2f2",
    iconBg: "#fef2f2",
    badgeBg: "#dc2626",
    catColor: "#dc2626",
    hoverColor: "#b91c1c",
    group: "clinical",
  },
  {
    match: /\bneurology\b/i,
    emoji: "🧠",
    thumbBg: "#f3f0ff",
    iconBg: "#f3f0ff",
    badgeBg: "#7c3aed",
    catColor: "#7c3aed",
    hoverColor: "#6d28d9",
    group: "clinical",
  },
  {
    match: /pulmon|respirat/i,
    emoji: "🫁",
    thumbBg: "#e0f7fa",
    iconBg: "#e0f7fa",
    badgeBg: "#0891b2",
    catColor: "#0891b2",
    hoverColor: "#0e7490",
    group: "clinical",
  },
  {
    match: /orthop/i,
    emoji: "🦴",
    thumbBg: "#fffbeb",
    iconBg: "#fffbeb",
    badgeBg: "#d97706",
    catColor: "#d97706",
    hoverColor: "#b45309",
    group: "surgical",
  },
  {
    match: /ophthal|eye/i,
    emoji: "👁️",
    thumbBg: "#e0f7fa",
    iconBg: "#e0f7fa",
    badgeBg: "#0891b2",
    catColor: "#0891b2",
    hoverColor: "#0e7490",
    group: "surgical",
  },
  {
    match: /pediatr|child/i,
    emoji: "👶",
    thumbBg: "#f0fdf4",
    iconBg: "#f0fdf4",
    badgeBg: "#059669",
    catColor: "#059669",
    hoverColor: "#047857",
    group: "clinical",
  },
  {
    match: /ob.?gyn|gynec|women/i,
    emoji: "🤰",
    thumbBg: "#fdf2f8",
    iconBg: "#fdf2f8",
    badgeBg: "#db2777",
    catColor: "#db2777",
    hoverColor: "#be185d",
    group: "surgical",
  },
  {
    match: /oncolog|cancer/i,
    emoji: "🧬",
    thumbBg: "#fdf4ff",
    iconBg: "#fdf4ff",
    badgeBg: "#a855f7",
    catColor: "#a855f7",
    hoverColor: "#9333ea",
    group: "clinical",
  },
  {
    match: /psych|mental/i,
    emoji: "🧘",
    thumbBg: "#eef2ff",
    iconBg: "#eef2ff",
    badgeBg: "#6366f1",
    catColor: "#6366f1",
    hoverColor: "#4f46e5",
    group: "clinical",
  },
  {
    match: /endocrin|diabetes/i,
    emoji: "🩸",
    thumbBg: "#fffbeb",
    iconBg: "#fffbeb",
    badgeBg: "#d97706",
    catColor: "#d97706",
    hoverColor: "#b45309",
    group: "clinical",
  },
  {
    match: /family medicine|family practice/i,
    emoji: "🏠",
    thumbBg: "#f8fafc",
    iconBg: "#f8fafc",
    badgeBg: "#16a34a",
    catColor: "#16a34a",
    hoverColor: "#15803d",
    group: "clinical",
  },
  {
    match: /hematol/i,
    emoji: "🩸",
    thumbBg: "#fef2f2",
    iconBg: "#fef2f2",
    badgeBg: "#be123c",
    catColor: "#be123c",
    hoverColor: "#9f1239",
    group: "clinical",
  },
  {
    match: /infect/i,
    emoji: "🦠",
    thumbBg: "#ecfdf5",
    iconBg: "#ecfdf5",
    badgeBg: "#059669",
    catColor: "#059669",
    hoverColor: "#047857",
    group: "clinical",
  },
  {
    match: /gastro/i,
    emoji: "🔬",
    thumbBg: "#fff7ed",
    iconBg: "#fff7ed",
    badgeBg: "#d97706",
    catColor: "#d97706",
    hoverColor: "#b45309",
    group: "clinical",
  },
  {
    match: /\bent\b|otolaryng/i,
    emoji: "👂",
    thumbBg: "#fffbeb",
    iconBg: "#fffbeb",
    badgeBg: "#d97706",
    catColor: "#d97706",
    hoverColor: "#b45309",
    group: "surgical",
  },
  {
    match: /general medicine/i,
    emoji: "🩺",
    thumbBg: "#f0f7ff",
    iconBg: "#f0f7ff",
    badgeBg: "#1a56a0",
    catColor: "#1a56a0",
    hoverColor: "#0f3d7a",
    group: "clinical",
  },
  {
    match: /rheumat/i,
    emoji: "💊",
    thumbBg: "#f3f4f6",
    iconBg: "#f3f4f6",
    badgeBg: "#475569",
    catColor: "#475569",
    hoverColor: "#334155",
    group: "clinical",
  },
  {
    match: /nephro|kidney/i,
    emoji: "🫘",
    thumbBg: "#f0fdf4",
    iconBg: "#f0fdf4",
    badgeBg: "#059669",
    catColor: "#059669",
    hoverColor: "#047857",
    group: "clinical",
  },
  {
    match: /urolog/i,
    emoji: "💉",
    thumbBg: "#ecfdf5",
    iconBg: "#ecfdf5",
    badgeBg: "#059669",
    catColor: "#059669",
    hoverColor: "#047857",
    group: "surgical",
  },
  {
    match: /internal medicine/i,
    emoji: "🩺",
    thumbBg: "#f0f7ff",
    iconBg: "#f0f7ff",
    badgeBg: "#1a56a0",
    catColor: "#1a56a0",
    hoverColor: "#0f3d7a",
    group: "clinical",
  },
  {
    match: /geriatr/i,
    emoji: "👴",
    thumbBg: "#fffbeb",
    iconBg: "#fffbeb",
    badgeBg: "#d97706",
    catColor: "#d97706",
    hoverColor: "#b45309",
    group: "clinical",
  },
  {
    match: /emergency/i,
    emoji: "🚨",
    thumbBg: "#fef2f2",
    iconBg: "#fef2f2",
    badgeBg: "#dc2626",
    catColor: "#dc2626",
    hoverColor: "#b91c1c",
    group: "clinical",
  },
  {
    match: /dermat|skin/i,
    emoji: "🧴",
    thumbBg: "#fff7ed",
    iconBg: "#fff7ed",
    badgeBg: "#ea580c",
    catColor: "#ea580c",
    hoverColor: "#c2410c",
    group: "clinical",
  },
  {
    match: /neurosurg/i,
    emoji: "🧠",
    thumbBg: "#f3f0ff",
    iconBg: "#f3f0ff",
    badgeBg: "#7c3aed",
    catColor: "#7c3aed",
    hoverColor: "#6d28d9",
    group: "surgical",
  },
  {
    match: /cardiothoracic/i,
    emoji: "❤️",
    thumbBg: "#fef2f2",
    iconBg: "#fef2f2",
    badgeBg: "#dc2626",
    catColor: "#dc2626",
    hoverColor: "#b91c1c",
    group: "surgical",
  },
  {
    match: /general surgery|surgery/i,
    emoji: "🔪",
    thumbBg: "#f0f7ff",
    iconBg: "#f0f7ff",
    badgeBg: "#1a56a0",
    catColor: "#1a56a0",
    hoverColor: "#0f3d7a",
    group: "surgical",
  },
  {
    match: /radiolog|imaging/i,
    emoji: "🩻",
    thumbBg: "#f0f7ff",
    iconBg: "#f0f7ff",
    badgeBg: "#1a56a0",
    catColor: "#1a56a0",
    hoverColor: "#0f3d7a",
    group: "diagnostic",
  },
  {
    match: /interventional radiology/i,
    emoji: "⚡",
    thumbBg: "#fff7ed",
    iconBg: "#fff7ed",
    badgeBg: "#d97706",
    catColor: "#d97706",
    hoverColor: "#b45309",
    group: "diagnostic",
  },
  {
    match: /patholog|histopath/i,
    emoji: "🔬",
    thumbBg: "#f3f4f6",
    iconBg: "#f3f4f6",
    badgeBg: "#475569",
    catColor: "#475569",
    hoverColor: "#334155",
    group: "diagnostic",
  },
  {
    match: /hematopath/i,
    emoji: "🩸",
    thumbBg: "#fef2f2",
    iconBg: "#fef2f2",
    badgeBg: "#dc2626",
    catColor: "#dc2626",
    hoverColor: "#b91c1c",
    group: "diagnostic",
  },
  {
    match: /nuclear/i,
    emoji: "☢️",
    thumbBg: "#fffbeb",
    iconBg: "#fffbeb",
    badgeBg: "#d97706",
    catColor: "#d97706",
    hoverColor: "#b45309",
    group: "diagnostic",
  },
  {
    match: /anesthes/i,
    emoji: "😴",
    thumbBg: "#eef2ff",
    iconBg: "#eef2ff",
    badgeBg: "#6366f1",
    catColor: "#6366f1",
    hoverColor: "#4f46e5",
    group: "diagnostic",
  },
  {
    match: /prevent/i,
    emoji: "🛡️",
    thumbBg: "#ecfdf5",
    iconBg: "#ecfdf5",
    badgeBg: "#059669",
    catColor: "#059669",
    hoverColor: "#047857",
    group: "other",
  },
  {
    match: /public health/i,
    emoji: "🌍",
    thumbBg: "#e0f7fa",
    iconBg: "#e0f7fa",
    badgeBg: "#0891b2",
    catColor: "#0891b2",
    hoverColor: "#0e7490",
    group: "other",
  },
  {
    match: /sport/i,
    emoji: "🏃",
    thumbBg: "#f0fdf4",
    iconBg: "#f0fdf4",
    badgeBg: "#059669",
    catColor: "#059669",
    hoverColor: "#047857",
    group: "other",
  },
  {
    match: /sleep/i,
    emoji: "😴",
    thumbBg: "#eef2ff",
    iconBg: "#eef2ff",
    badgeBg: "#6366f1",
    catColor: "#6366f1",
    hoverColor: "#4f46e5",
    group: "other",
  },
  {
    match: /palliat/i,
    emoji: "🕊️",
    thumbBg: "#f8fafc",
    iconBg: "#f8fafc",
    badgeBg: "#64748b",
    catColor: "#64748b",
    hoverColor: "#475569",
    group: "other",
  },
  {
    match: /genetic/i,
    emoji: "🧬",
    thumbBg: "#fdf4ff",
    iconBg: "#fdf4ff",
    badgeBg: "#a855f7",
    catColor: "#a855f7",
    hoverColor: "#9333ea",
    group: "other",
  },
  {
    match: /nutrition|lifestyle/i,
    emoji: "🍎",
    thumbBg: "#ecfdf5",
    iconBg: "#ecfdf5",
    badgeBg: "#059669",
    catColor: "#059669",
    hoverColor: "#047857",
    group: "other",
  },
  {
    match: /dental/i,
    emoji: "🦷",
    thumbBg: "#e0f7fa",
    iconBg: "#e0f7fa",
    badgeBg: "#0891b2",
    catColor: "#0891b2",
    hoverColor: "#0e7490",
    group: "other",
  },
  {
    match: /fitness/i,
    emoji: "🏃",
    thumbBg: "#f0fdf4",
    iconBg: "#f0fdf4",
    badgeBg: "#16a34a",
    catColor: "#16a34a",
    hoverColor: "#15803d",
    group: "other",
  },
  {
    match: /general health/i,
    emoji: "🏥",
    thumbBg: "#e8f0fb",
    iconBg: "#e8f0fb",
    badgeBg: "#1a56a0",
    catColor: "#1a56a0",
    hoverColor: "#0f3d7a",
    group: "other",
  },
  {
    match: /men'?s health/i,
    emoji: "👨‍⚕️",
    thumbBg: "#dbeafe",
    iconBg: "#dbeafe",
    badgeBg: "#2563eb",
    catColor: "#2563eb",
    hoverColor: "#1d4ed8",
    group: "other",
  },
  {
    match: /occupational/i,
    emoji: "💼",
    thumbBg: "#fffbeb",
    iconBg: "#fffbeb",
    badgeBg: "#d97706",
    catColor: "#d97706",
    hoverColor: "#b45309",
    group: "other",
  },
];

const GROUP_SPEC_CLASS: Record<CategoryGroup, "clinical" | "surgical" | "other"> = {
  clinical: "clinical",
  surgical: "surgical",
  diagnostic: "other",
  other: "other",
};

const PRIMARY_SORT_COUNT = 18;

function findSpecialtyDefinition(categoryName: string): SpecialtyDefinition | undefined {
  return SPECIALTY_DEFINITIONS.find((def) => def.match.test(categoryName));
}

export function getCategorySortIndex(categoryName: string): number {
  const idx = SPECIALTY_DEFINITIONS.findIndex((def) => def.match.test(categoryName));
  return idx >= 0 ? idx : PRIMARY_SORT_COUNT + 100;
}

export function getBlogCategoryVisuals(categoryName: string): BlogCategoryVisuals {
  const entry = findSpecialtyDefinition(categoryName);
  const group = entry?.group ?? DEFAULT_VISUALS.group;
  const sortIndex = getCategorySortIndex(categoryName);

  if (!entry) {
    return { ...DEFAULT_VISUALS, sortIndex };
  }

  return {
    emoji: entry.emoji,
    thumbBg: entry.thumbBg,
    iconBg: entry.iconBg,
    badgeBg: entry.badgeBg,
    catColor: entry.catColor,
    hoverColor: entry.hoverColor,
    group,
    specTagClass: GROUP_SPEC_CLASS[group],
    sortIndex,
  };
}

export function sortBlogCategories(categories: BlogCategory[]): BlogCategory[] {
  return [...categories].sort((a, b) => {
    const orderDiff = getCategorySortIndex(a.name) - getCategorySortIndex(b.name);
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name);
  });
}

export function prioritizeCategorySlugFirst<T extends { category?: { slug?: string } | null }>(
  posts: T[],
  categorySlug: string | undefined,
): T[] {
  if (!categorySlug || posts.length === 0) return posts;
  const index = posts.findIndex((p) => p.category?.slug === categorySlug);
  if (index <= 0) return posts;
  const reordered = [...posts];
  const [first] = reordered.splice(index, 1);
  return [first, ...reordered];
}

/** Keeps a category first in the grid; injects from `supplementalPosts` when the page has none left (e.g. hero consumed the only slot). */
export function ensureCategorySlugFirstInPosts<
  T extends { slug: string; category?: { slug?: string } | null },
>(
  posts: T[],
  categorySlug: string | undefined,
  options?: {
    supplementalPosts?: T[];
    excludeSlug?: string;
    maxLength?: number;
  },
): T[] {
  if (!categorySlug || posts.length === 0) return posts;

  let result = prioritizeCategorySlugFirst(posts, categorySlug);

  if (!result.some((p) => p.category?.slug === categorySlug)) {
    const candidate = options?.supplementalPosts?.find(
      (p) =>
        p.category?.slug === categorySlug &&
        p.slug !== options?.excludeSlug &&
        !result.some((r) => r.slug === p.slug),
    );
    if (candidate) {
      result = [candidate, ...result];
      if (options?.maxLength && result.length > options.maxLength) {
        result = result.slice(0, options.maxLength);
      }
    }
  }

  return result;
}

export function sortCategoriesWithCardiologyFirst(
  categories: BlogCategory[],
  cardiologySlug?: string,
): BlogCategory[] {
  const sorted = sortBlogCategories(categories);
  if (!cardiologySlug) return sorted;
  const index = sorted.findIndex((c) => c.slug === cardiologySlug);
  if (index <= 0) return sorted;
  const reordered = [...sorted];
  const [cardiology] = reordered.splice(index, 1);
  return [cardiology, ...reordered];
}

export function resolveCardiologySlug(categories: BlogCategory[] | undefined): string | undefined {
  return categories?.find(
    (c) => c.slug === 'cardiology' || /cardiology/i.test(c.name),
  )?.slug;
}

export function resolveCardiologyHeroPost(
  cardiologyPosts: BlogPost[] | undefined,
  fallbackPost: BlogPost | null | undefined,
): BlogPost | null {
  if (cardiologyPosts?.length) {
    const featured = cardiologyPosts.find((p) => p.featured);
    return featured ?? cardiologyPosts[0];
  }
  return fallbackPost ?? null;
}

export const CATEGORY_GROUP_TABS: { id: CategoryGroup; label: string }[] = [
  { id: "clinical", label: "Clinical Specialties" },
  { id: "surgical", label: "Surgical Specialties" },
  { id: "diagnostic", label: "Diagnostic & Lab" },
  { id: "other", label: "Other Fields" },
];

export type CategoryAccentStyle = CSSProperties & {
  "--cat-accent"?: string;
  "--cat-hover"?: string;
  "--cat-bg"?: string;
};

export function categoryAccentStyle(visuals: BlogCategoryVisuals): CategoryAccentStyle {
  return {
    "--cat-accent": visuals.catColor,
    "--cat-hover": visuals.hoverColor,
    "--cat-bg": visuals.iconBg,
  };
}
