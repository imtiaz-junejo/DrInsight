"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CategorySectionProps = {
  tabIndex: number;
  activeTab: number;
  animationKey: number;
  emoji: string;
  title: string;
  subtitle: string;
  spaced?: boolean;
  children: ReactNode;
};

export function CategorySection({
  tabIndex,
  activeTab,
  animationKey,
  emoji,
  title,
  subtitle,
  spaced,
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
      <h2 className={cn("category-title", spaced && "spaced")}>
        {emoji} {title}
      </h2>
      <p className="category-subtitle">{subtitle}</p>
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
