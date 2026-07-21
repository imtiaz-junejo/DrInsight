"use client";

import { useCallback, useEffect, useRef } from "react";

const DEBOUNCE_MS = 400;

export function normalizeSearch(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

type QuestionSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (normalized: string) => void;
  isSearching?: boolean;
};

export function QuestionSearchBar({ value, onChange, onSearch, isSearching }: QuestionSearchBarProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const flushSearch = useCallback(
    (raw: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      onSearch(normalizeSearch(raw));
    },
    [onSearch],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(normalizeSearch(value));
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, onSearch]);

  const handleClear = () => {
    onChange("");
    flushSearch("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      flushSearch(value);
    }
    if (e.key === "Escape" && value) {
      handleClear();
    }
  };

  return (
    <div className="search-bar">
      <div className={`search-input-wrap${isSearching ? " is-searching" : ""}`}>
        <span className="search-input-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          className="search-input bg-gray-100"
          placeholder="Search questions by symptom, condition, or keyword..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search questions"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className="search-input-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {isSearching && (
          <span className="search-input-spinner" aria-hidden />
        )}
      </div>
      <button type="button" className="search-submit-btn" onClick={() => flushSearch(value)}>
        Search
      </button>
    </div>
  );
}
