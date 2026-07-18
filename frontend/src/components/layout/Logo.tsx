"use client";

import { BRAND_LOGO_ALT, HEADER_LOGO_SRC } from "@/config/brand-logos";
import { cn } from "@/lib/utils";
import { usePublicSiteConfig } from "@/services/configuration-api-hooks";

export function Logo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
  textClassName?: string;
}) {
  const siteConfig = usePublicSiteConfig();
  const src = siteConfig.data?.logoUrl?.trim() || HEADER_LOGO_SRC;
  const alt = siteConfig.data?.siteName?.trim() || BRAND_LOGO_ALT;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          "block h-[90px] w-auto max-h-[90px] max-w-full shrink-0 object-contain p-3",
          imgClassName,
        )}
      />
    </div>
  );
}
