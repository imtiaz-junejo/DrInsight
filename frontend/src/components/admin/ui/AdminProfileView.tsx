"use client";

import type { ReactNode } from "react";

export function AdminProfileBanner({
  identity,
  actions,
  tone = "patient",
}: {
  identity: ReactNode;
  actions: ReactNode;
  tone?: "patient" | "doctor";
}) {
  return (
    <div className={`admin-profile-banner admin-profile-banner--${tone}`}>
      <div className="admin-profile-banner-left">{identity}</div>
      <div className="admin-profile-banner-actions">{actions}</div>
    </div>
  );
}

export function AdminProfileGrid({ children }: { children: ReactNode }) {
  return <div className="admin-profile-grid">{children}</div>;
}

export function AdminProfileCard({
  title,
  icon,
  tone = "blue",
  children,
}: {
  title: string;
  icon: string;
  tone?: "blue" | "teal";
  children: ReactNode;
}) {
  return (
    <div className={`admin-profile-card admin-profile-card--${tone}`}>
      <div className="admin-profile-card-hd">
        <span className="admin-profile-card-icon" aria-hidden>
          {icon}
        </span>
        <h3>{title}</h3>
      </div>
      <div className="admin-profile-card-bd">{children}</div>
    </div>
  );
}

export function AdminProfileRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="admin-profile-row">
      <span className="admin-profile-label">{label}</span>
      <span className="admin-profile-value">{value}</span>
    </div>
  );
}

export function AdminProfileStats({ items }: { items: { value: number; label: string }[] }) {
  return (
    <div className="admin-profile-stats kv-grid">
      {items.map((item) => (
        <div className="kv-card admin-profile-stat-card" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
