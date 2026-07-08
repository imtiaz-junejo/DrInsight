"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { labelResponsiveTables } from "@/lib/responsive-tables";

export function ResponsiveTableLabels() {
  const pathname = usePathname();

  useEffect(() => {
    labelResponsiveTables();

    const observer = new MutationObserver(() => {
      labelResponsiveTables();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
