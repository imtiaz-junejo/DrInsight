"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import type { HealthToolModalData, StatusVariant } from "./types";

const STATUS_CLASS: Record<StatusVariant, string> = {
  good: "ht-status--good",
  moderate: "ht-status--moderate",
  warning: "ht-status--warning",
  danger: "ht-status--danger",
  info: "ht-status--info",
};

type CalculatorResultModalProps = {
  data: HealthToolModalData | null;
  onClose: () => void;
  onCalculateAgain: (toolId: string) => void;
};

export function CalculatorResultModal({ data, onClose, onCalculateAgain }: CalculatorResultModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!data) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [data, handleKeyDown]);

  if (!data) return null;

  return (
    <div className="ht-modal-root" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="ht-modal bg-gray-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ht-modal-header">
          <div className={cn("ht-modal-icon", `calc-card-icon--${data.iconClass}`)} aria-hidden>
            {data.icon}
          </div>
          <div className="ht-modal-header-text">
            <h2 id={titleId} className="ht-modal-title">
              {data.title}
            </h2>
            <div className="ht-modal-result-inline">
              <div className="ht-modal-result-primary">
                <span className="ht-modal-result-value">{data.primaryValue}</span>
              </div>
              <div className="ht-modal-result-status">
                <span className={cn("ht-status", STATUS_CLASS[data.status.variant])}>{data.status.text}</span>
              </div>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="ht-modal-close"
            onClick={onClose}
            aria-label="Close results"
          >
            ✕
          </button>
        </div>

        <div className="ht-modal-sections">
          {data.sections.map((section) => (
            <section
              key={section.title}
              className={cn("ht-modal-section", section.variant && `ht-modal-section--${section.variant}`)}
            >
              <h3 className="ht-modal-section-title">{section.title}</h3>
              <div className="ht-modal-section-body">{section.content}</div>
            </section>
          ))}
        </div>

        <div className="ht-modal-actions">
          <button type="button" className="ht-modal-btn ht-modal-btn--ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="ht-modal-btn ht-modal-btn--primary"
            onClick={() => {
              onCalculateAgain(data.toolId);
              onClose();
            }}
          >
            Calculate Again
          </button>
        </div>
      </div>
    </div>
  );
}
