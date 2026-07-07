import { getBlogCategoryVisuals } from "@/lib/blog-category";

type CategoryIconProps = {
  categoryName: string;
  size?: number;
  className?: string;
};

export function CategoryIcon({ categoryName, size = 20, className }: CategoryIconProps) {
  const { emoji } = getBlogCategoryVisuals(categoryName);

  return (
    <span
      className={`category-emoji-icon${className ? ` ${className}` : ""}`}
      style={{ fontSize: size }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}
