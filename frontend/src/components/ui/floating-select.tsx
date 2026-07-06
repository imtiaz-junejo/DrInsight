"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  children: React.ReactNode;
}

const FloatingSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>(
  (
    {
      label,
      error,
      hint,
      containerClassName,
      className,
      id: idProp,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const isControlled = value !== undefined;
    const [focused, setFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(() =>
      defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : "",
    );

    const currentValue = isControlled ? String(value ?? "") : internalValue;
    const hasValue = currentValue.length > 0;
    const floated = focused || hasValue;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(false);
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    return (
      <div className={cn("relative", containerClassName)}>
        <select
          ref={ref}
          id={id}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={cn(
            "block h-11 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3.5 pb-2 pt-5 text-sm text-gray-900 outline-none transition",
            "focus:border-blue focus:bg-white focus:ring-[3px] focus:ring-blue/10",
            error && "border-red focus:border-red focus:ring-red/10",
            className,
          )}
          {...props}
        >
          {children}
        </select>
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
        {error && (
          <p className="mt-1.5 text-xs text-red" role="alert">
            {error}
          </p>
        )}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      </div>
    );
  },
);
FloatingSelect.displayName = "FloatingSelect";

export { FloatingSelect };
