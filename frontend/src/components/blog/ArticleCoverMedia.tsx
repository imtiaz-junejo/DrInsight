"use client";

import { useEffect, useState } from "react";
import { CategoryIcon } from "@/components/blog/CategoryIcon";
import { getBlogCategoryVisuals } from "@/lib/blog-category";

export function isRenderableImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  const trimmed = url.trim();
  if (trimmed === "null" || trimmed === "undefined") return false;
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/")
  );
}

type ArticleCoverMediaProps = {
  imageUrl?: string | null;
  categoryName: string;
  alt?: string;
  emojiSize: number;
  className?: string;
  style?: React.CSSProperties;
  useHeroGradient?: boolean;
  children?: React.ReactNode;
};

export function ArticleCoverMedia({
  imageUrl,
  categoryName,
  alt = "",
  emojiSize,
  className,
  style,
  useHeroGradient = false,
  children,
}: ArticleCoverMediaProps) {
  const [failed, setFailed] = useState(false);
  const visuals = getBlogCategoryVisuals(categoryName);
  const canShowImage = isRenderableImageUrl(imageUrl) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  const fallbackBackground = useHeroGradient
    ? `linear-gradient(135deg, ${visuals.thumbBg}, #e0f7fa)`
    : visuals.thumbBg;

  return (
    <div
      className={className}
      style={{
        ...style,
        background: canShowImage ? style?.background : (style?.background ?? fallbackBackground),
      }}
    >
      {canShowImage ? (
        <img src={imageUrl!.trim()} alt={alt} onError={() => setFailed(true)} />
      ) : (
        <CategoryIcon categoryName={categoryName} size={emojiSize} />
      )}
      {children}
    </div>
  );
}
