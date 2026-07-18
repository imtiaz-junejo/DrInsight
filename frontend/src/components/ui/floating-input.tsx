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

function isInputAutofilled(el: HTMLInputElement): boolean {
  try {
    return el.matches(":-webkit-autofill") || el.matches(":autofill");
  } catch {
    return false;
  }
}

function inputHasContent(el: HTMLInputElement): boolean {
  return el.value.trim().length > 0 || isInputAutofilled(el);
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
      onAnimationStart,
      onChange,
      onInput,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [floated, setFloated] = React.useState(false);

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const syncFloatedState = React.useCallback(() => {
      const el = inputRef.current;
      if (!el) return;
      setFloated(inputHasContent(el));
    }, []);

    React.useLayoutEffect(() => {
      syncFloatedState();

      const el = inputRef.current;
      if (!el) return;

      const onFieldUpdate = () => syncFloatedState();
      el.addEventListener("input", onFieldUpdate);
      el.addEventListener("change", onFieldUpdate);

      const pollMs = [0, 50, 100, 200, 400, 700, 1000, 1500, 2500, 4000, 6000];
      const timers = pollMs.map((delay) => window.setTimeout(syncFloatedState, delay));

      return () => {
        el.removeEventListener("input", onFieldUpdate);
        el.removeEventListener("change", onFieldUpdate);
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }, [syncFloatedState]);

    const handleAnimationStart = (e: React.AnimationEvent<HTMLInputElement>) => {
      if (
        e.animationName === "floating-input-autofill-start" ||
        e.animationName === "floating-input-autofill-cancel"
      ) {
        syncFloatedState();
      }
      onAnimationStart?.(e);
    };

    const hasSuffix = showPasswordToggle || suffix;
    const inputPadding =
      showPasswordToggle && suffix ? "pr-16" : hasSuffix ? "pr-10" : undefined;

    return (
      <div className={cn("relative", containerClassName)}>
        <input
          ref={setRefs}
          id={id}
          placeholder=" "
          onAnimationStart={handleAnimationStart}
          onChange={(e) => {
            syncFloatedState();
            onChange?.(e);
          }}
          onInput={(e) => {
            syncFloatedState();
            onInput?.(e);
          }}
          onFocus={(e) => {
            setFloated(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            syncFloatedState();
            onBlur?.(e);
          }}
          className={cn(
            "floating-input peer block h-11 w-full rounded-xl border border-gray-400 bg-gray-200 px-3.5 pb-2 pt-5 text-sm text-gray-900 outline-none transition placeholder:text-transparent",
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
            "floating-input-label pointer-events-none absolute z-10 text-gray-500 transition-all duration-200",
            floated && "floating-input-label--floated",
            error && floated && "text-red",
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
