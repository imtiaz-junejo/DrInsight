"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SearchableFloatingSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  containerClassName?: string;
}

export function SearchableFloatingSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Search…",
  disabled = false,
  error,
  containerClassName,
}: SearchableFloatingSelectProps) {
  const id = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  const selected = options.find((opt) => opt.value === value);
  const displayValue = open ? query : (selected?.label ?? "");
  const filtered = options.filter((opt) => opt.label.toLowerCase().includes(query.trim().toLowerCase()));

  React.useEffect(() => {
    if (!open) {
      setQuery(selected?.label ?? "");
    }
  }, [open, selected?.label]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const floated = focused || open || Boolean(value);

  return (
    <div ref={rootRef} className={cn("relative", containerClassName)}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        value={displayValue}
        placeholder={floated ? placeholder : undefined}
        onFocus={() => {
          if (disabled) return;
          setFocused(true);
          setOpen(true);
          setQuery(selected?.label ?? "");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value.trim()) onChange("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setFocused(false);
          }
        }}
        className={cn(
          "block h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 pb-2 pt-5 text-sm text-gray-900 outline-none transition",
          "focus:border-blue focus:bg-white focus:ring-[3px] focus:ring-blue/10",
          error && "border-red focus:border-red focus:ring-red/10",
          disabled && "cursor-not-allowed opacity-70",
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute z-10 text-gray-500 transition-all duration-200",
          floated
            ? "top-[-6px] left-2.5 translate-y-0 bg-white px-2 text-xs"
            : "left-3.5 top-1/2 -translate-y-1/2 bg-transparent text-sm",
          focused && floated && "text-blue",
          error && focused && "text-red",
        )}
      >
        {label}
      </label>

      {open && !disabled && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-400">No matches</li>
          ) : (
            filtered.map((opt) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition hover:bg-blue-light",
                    opt.value === value && "bg-blue-light font-semibold text-blue",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(opt.value);
                    setQuery(opt.label);
                    setOpen(false);
                    setFocused(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
