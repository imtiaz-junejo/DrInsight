"use client";

import {
  HERO_ICON_DROPDOWN_OPTIONS,
  resolveHeroIcon,
} from "@/lib/article-hero-icons";

type ArticleHeroIconPickerProps = {
  optionId: string;
  value: string;
  onChange: (optionId: string, icon: string) => void;
};

export function ArticleHeroIconPicker({ optionId, value, onChange }: ArticleHeroIconPickerProps) {
  return (
  <>
      <input type="hidden" name="artHeroIcon" value={value} readOnly />
      <select
        id="artHeroIconSelect"
        className="art-hero-icon-select border border-gray-300"
        value={optionId}
        onChange={(e) => {
          e.stopPropagation();
          const nextOptionId = e.target.value;
          onChange(nextOptionId, resolveHeroIcon(nextOptionId));
        }}
      >
        {HERO_ICON_DROPDOWN_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
    </>
  );
}

export {
  DEFAULT_HERO_ICON_OPTION_ID,
  getDefaultHeroIconForSpecialty,
  getHeroIconOptionIdForSpecialty,
} from "@/lib/article-hero-icons";
