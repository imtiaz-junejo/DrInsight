"use client";

import { useMemo, useState } from "react";
import {
  CATEGORY_GROUP_TABS,
  categoryAccentStyle,
  getBlogCategoryVisuals,
  sortBlogCategories,
  type CategoryGroup,
} from "@/lib/blog-category";
import { CategoryIcon } from "@/components/blog/CategoryIcon";
import { SectionEyebrow, SectionDescription, SectionTitle } from "@/components/public/section-heading";
import type { BlogCategory } from "@/services/api-hooks";

type AllSpecialtiesSectionProps = {
  categories: BlogCategory[] | undefined;
  activeCategorySlug?: string | null;
  onSelectCategory: (slug: string) => void;
  isLoading?: boolean;
};

export function AllSpecialtiesSection({
  categories,
  activeCategorySlug,
  onSelectCategory,
  isLoading,
}: AllSpecialtiesSectionProps) {
  const [activeTab, setActiveTab] = useState<CategoryGroup>("clinical");

  const grouped = useMemo(() => {
    const sorted = sortBlogCategories(categories ?? []);
    const buckets: Record<CategoryGroup, BlogCategory[]> = {
      clinical: [],
      surgical: [],
      diagnostic: [],
      other: [],
    };
    for (const cat of sorted) {
      const group = getBlogCategoryVisuals(cat.name).group;
      buckets[group].push(cat);
    }
    return buckets;
  }, [categories]);

  const visible = grouped[activeTab];

  return (
    <div className="cats-section">
      <div className="cats-inner">
        <div className="cats-section-header">
          <SectionEyebrow className="section-eyebrow">All Specialties</SectionEyebrow>
          <SectionTitle as="div" className="section-title !text-2xl">
            Browse by Medical Category
          </SectionTitle>
          <SectionDescription align="left" className="!mx-0 !max-w-none !mt-2 !text-[0.84rem]">
            Explore our full library of doctor-written articles across every medical field
          </SectionDescription>
        </div>

        <div className="cats-tabs" role="tablist" aria-label="Specialty groups">
          {CATEGORY_GROUP_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`cats-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="cats-grid" id="cats-grid">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="cat-tile cat-tile--skeleton" aria-hidden>
                  <div className="cat-tile-ico cat-tile-skeleton-ico" />
                  <div className="cat-tile-skeleton-text">
                    <div className="cat-tile-skeleton-line" />
                    <div className="cat-tile-skeleton-line cat-tile-skeleton-line--sm" />
                  </div>
                </div>
              ))
            : visible.length > 0
              ? visible.map((cat) => {
                  const visuals = getBlogCategoryVisuals(cat.name);
                  const isActive = activeCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`cat-tile cat-tile--accent${isActive ? " active" : ""}`}
                      style={categoryAccentStyle(visuals)}
                      onClick={() => onSelectCategory(cat.slug)}
                    >
                      <div className="cat-tile-ico" style={{ background: visuals.iconBg }}>
                        <CategoryIcon categoryName={cat.name} size={16} />
                      </div>
                      <div>
                        <h4>{cat.name}</h4>
                        <span>
                          {cat.postCount ?? 0} article{(cat.postCount ?? 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                    </button>
                  );
                })
              : (
                  <p className="cats-empty">No specialties in this group yet.</p>
                )}
        </div>
      </div>
    </div>
  );
}
