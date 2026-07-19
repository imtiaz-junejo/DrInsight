"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { allAdminNavItems } from "@/config/admin-nav";
import { AdminNavIcon } from "@/components/doctor/icons/DoctorIcons";

export function AdminSearch() {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return allAdminNavItems
      .filter((item) => item.name.toLowerCase().includes(term))
      .slice(0, 8);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = (href: string) => {
    router.push(href);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) navigate(target.href);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const showResults = open && query.trim().length > 0;

  return (
    <div className="tb-search" ref={containerRef}>
      <input
        type="text"
        placeholder="Search anything..."
        value={query}
        role="combobox"
        aria-expanded={showResults}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-label="Search admin sections"
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {showResults ? (
        <ul className="tb-search-results" id={listboxId} role="listbox">
          {results.length === 0 ? (
            <li className="tb-search-empty">No matching sections</li>
          ) : (
            results.map((item, index) => (
              <li
                key={item.id}
                role="option"
                aria-selected={index === activeIndex}
                className={`tb-search-item${index === activeIndex ? " on" : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  navigate(item.href);
                }}
              >
                <span className="sb-ico">
                  <AdminNavIcon id={item.id} />
                </span>
                {item.name}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
