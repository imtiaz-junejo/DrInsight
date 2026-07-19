"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Consultation action modal — pixel match of the `cons-box` overlay in
 * doctor-dashboard.html (Add Notes / Cancel / Reschedule / Details boxes).
 */
export function ConsModal({
  open,
  icon,
  title,
  warn,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  icon: ReactNode;
  title: string;
  warn?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      id="consOverlay"
      className="open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cons-box">
        <div className={`cons-hd${warn ? " warn" : ""}`}>
          <div className="cons-ic">{icon}</div>
          <h4>{title}</h4>
          <button type="button" className="cons-x" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>
        <div className="cons-bd">{children}</div>
        <div className="cons-ft">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}

export function ConsModalButton({
  variant,
  onClick,
  disabled,
  children,
}: {
  variant: "ghost" | "blue" | "red";
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" className={`cons-btn ${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
