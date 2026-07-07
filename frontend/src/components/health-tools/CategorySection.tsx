"use client";

import type { ReactNode } from "react";

type CategorySectionProps = {
  tabIndex: number;
  activeTab: number;
  animationKey: number;
  emoji: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

function CategoryDivider({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <>
      <div className="category-divider">
        <div className="category-divider-line" aria-hidden />
        <h2 className="category-divider-text">
          {emoji} {title}
        </h2>
        <div className="category-divider-line" aria-hidden />
      </div>
      <p className="category-divider-sub">{subtitle}</p>
    </>
  );
}

export function CategorySection({
  tabIndex,
  activeTab,
  animationKey,
  emoji,
  title,
  subtitle,
  children,
}: CategorySectionProps) {
  const isAllTools = activeTab === 0;
  const isActive = isAllTools || activeTab === tabIndex;

  if (!isActive) return null;

  return (
    <div
      className="tools-category-panel"
      key={isAllTools ? `all-${tabIndex}` : `${tabIndex}-${animationKey}`}
      data-category={tabIndex}
    >
      <CategoryDivider emoji={emoji} title={title} subtitle={subtitle} />
      <div className="tools-grid">{children}</div>
    </div>
  );
}

export const CATEGORY_TAB = {
  ALL: 0,
  BODY: 1,
  NUTRITION: 2,
  HEART: 3,
  WOMENS: 4,
  RISK: 5,
  MENTAL: 6,
} as const;
