"use client";

import { cn } from "@/lib/utils";

type RadioPillsProps = {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function RadioPills({ options, value, onChange, disabled }: RadioPillsProps) {
  return (
    <div className="radio-pills">
      {options.map((opt) => (
        <span
          key={opt}
          className={cn("radio-pill", value === opt && "selected", disabled && "opacity-60")}
          onClick={() => !disabled && onChange(opt)}
          onKeyDown={(e) => e.key === "Enter" && !disabled && onChange(opt)}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-pressed={value === opt}
        >
          {opt}
        </span>
      ))}
    </div>
  );
}
