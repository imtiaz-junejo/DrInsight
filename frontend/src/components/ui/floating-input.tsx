"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onPasswordToggle?: () => void;
  suffix?: React.ReactNode;
  labelAction?: React.ReactNode;
}

function getInitialValue(defaultValue?: string | number | readonly string[]) {
  if (defaultValue === undefined || defaultValue === null) return "";
  return String(defaultValue);
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      error,
      hint,
      containerClassName,
      className,
      id: idProp,
      showPasswordToggle,
      passwordVisible,
      onPasswordToggle,
      suffix,
      labelAction,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const isControlled = value !== undefined;
    const [focused, setFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(() => getInitialValue(defaultValue));

    const currentValue = isControlled ? String(value ?? "") : internalValue;
    const hasValue = currentValue.length > 0;
    const floated = focused || hasValue;
    const hasSuffix = showPasswordToggle || suffix;
    const inputPadding =
      showPasswordToggle && suffix ? "pr-16" : hasSuffix ? "pr-10" : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.currentTarget.value);
      }
    };

    return (
      <div className={cn("relative", containerClassName)}>
        <input
          ref={ref}
          id={id}
          placeholder=" "
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onInput={handleInput}
          className={cn(
            "peer block h-11 w-full rounded-xl border border-gray-400 bg-gray-200 px-3.5 pb-2 pt-5 text-sm text-gray-900 outline-none transition placeholder:text-transparent",
            "focus:border-blue focus:bg-white focus:ring-[3px] focus:ring-blue/10",
            error && "border-red focus:border-red focus:ring-red/10",
            inputPadding,
            className,
          )}
          {...props}
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
        {labelAction && (
          <div className="absolute right-3.5 top-[-6px] z-20 translate-y-0 text-xs">{labelAction}</div>
        )}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onPasswordToggle}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-[.9rem]"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? "🙈" : "👁️"}
          </button>
        )}
        {suffix}
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
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
