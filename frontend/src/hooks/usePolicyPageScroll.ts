"use client";

import { useCallback, useEffect, useState } from "react";

export function usePolicyPageScroll(sectionIds: string[], scrollOffset = 130) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? "s1");

  useEffect(() => {
    const onScroll = () => {
      let active = sectionIds[0] ?? "s1";
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < scrollOffset) active = id;
      });
      setActiveSection(active);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds, scrollOffset]);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { activeSection, scrollToSection, scrollToTop };
}
