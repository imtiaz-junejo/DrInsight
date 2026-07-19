"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { avatarGradient, getInitials, hashString } from "@/lib/doctor-utils";
import { resolveDashboardIcon } from "@/components/doctor/icons/resolveEmojiIcon";

export function PersonAvatar({
  initials,
  seed,
  className = "dr-av",
  style,
}: {
  initials: string;
  seed?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const bg = avatarGradient(hashString(seed ?? initials));
  return (
    <div className={className} style={{ background: bg, ...style }}>
      {initials}
    </div>
  );
}

export function UserAvatarFromName({
  firstName,
  lastName,
  seed,
  className = "dr-av",
}: {
  firstName?: string | null;
  lastName?: string | null;
  seed?: string;
  className?: string;
}) {
  return (
    <PersonAvatar
      initials={getInitials(firstName, lastName)}
      seed={seed ?? `${firstName}${lastName}`}
      className={className}
    />
  );
}

export interface DoctorStatCardItem {
  ic: string;
  icon: ReactNode;
  num: string;
  label: string;
  tag: string;
  tagClass: string;
  bgIcon?: ReactNode;
}

export function StatCardRow({ items }: { items: DoctorStatCardItem[] }) {
  return (
    <div className="stats-row">
      {items.map((item) => (
        <div key={item.label} className="stat-c">
          <div className={`stat-ic ${item.ic}`}>{resolveDashboardIcon(item.icon)}</div>
          <strong>{item.num}</strong>
          <span>{item.label}</span>
          <div className={`stat-tag ${item.tagClass}`}>{item.tag}</div>
          {item.bgIcon ? <div className="stat-bg">{resolveDashboardIcon(item.bgIcon)}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function DashPageHeader({
  subtitle,
  title,
  dateStr,
  actions,
}: {
  subtitle: ReactNode;
  title: ReactNode;
  dateStr: string;
  actions?: ReactNode;
}) {
  return (
    <div className="dash-hd">
      <div className="dash-hd-l">
        <p>{subtitle}</p>
        <h1>{title}</h1>
        <span>{dateStr}</span>
      </div>
      {actions ? <div className="dash-hd-r">{actions}</div> : null}
    </div>
  );
}

export function DashCard({
  title,
  actions,
  children,
  headerExtra,
}: {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  headerExtra?: ReactNode;
}) {
  return (
    <div className="card">
      <div className="card-hd">
        <h3>{title}</h3>
        {headerExtra}
        {actions}
      </div>
      <div className="card-bd">{children}</div>
    </div>
  );
}

export function CardLink({ href, onClick, children }: { href?: string; onClick?: () => void; children: ReactNode }) {
  if (href) {
    return (
      <Link href={href} className="card-action">
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className="card-action" onClick={onClick}>
      {children}
    </button>
  );
}

export function DashButton({
  children,
  variant = "outline",
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  variant?: "solid" | "outline" | "danger" | "primary";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  if (variant === "solid") {
    return (
      <button type={type} className="btn-w" onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  }
  if (variant === "outline") {
    return (
      <button type={type} className="btn-wo" onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  }
  if (variant === "danger") {
    return (
      <button type={type} className="ca-btn danger" onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  }
  return (
    <button type={type} className="ca-btn primary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function ActionButton({
  children,
  variant = "default",
  onClick,
}: {
  children: ReactNode;
  variant?: "default" | "primary" | "danger";
  onClick?: () => void;
}) {
  const cls = variant === "primary" ? "ca-btn primary" : variant === "danger" ? "ca-btn danger" : "ca-btn";
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

export function TableButton({
  children,
  variant = "default",
  onClick,
}: {
  children: ReactNode;
  variant?: "default" | "view";
  onClick?: () => void;
}) {
  return (
    <button type="button" className={`tbl-btn${variant === "view" ? " view" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function FilterPills({
  filters,
  activeIndex = 0,
  onChange,
}: {
  filters: string[];
  activeIndex?: number;
  onChange?: (index: number) => void;
}) {
  return (
    <div className="flt-pills">
      {filters.map((filter, index) => (
        <button
          key={filter}
          type="button"
          className={`flt${index === activeIndex ? " on" : ""}`}
          onClick={() => onChange?.(index)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export function EarningsChart({ data, height = 52 }: { data: Array<{ label: string; height: number; highlight?: boolean }>; height?: number }) {
  return (
    <div className="chart-bars" style={{ height }}>
      {data.map((item) => (
        <div key={item.label} className="cb-wrap">
          <div
            className="cb-bar"
            style={{
              height: `${item.height}%`,
              ...(item.highlight ? { background: "linear-gradient(180deg,var(--teal),var(--blue))" } : {}),
            }}
          />
          <div className="cb-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--gray-100)",
      }}
    >
      <span style={{ fontSize: "0.8rem", color: "var(--gray-500)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--gray-900)" }}>{value}</span>
    </div>
  );
}

export function SettingsRow({
  icon,
  title,
  description,
  actionLabel,
  danger,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  danger?: boolean;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "14px 0",
        borderBottom: "1px solid var(--gray-100)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="dr-settings-icon">{icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{title}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>{description}</div>
        </div>
      </div>
      <ActionButton variant={danger ? "danger" : "default"} onClick={onAction}>
        {actionLabel}
      </ActionButton>
    </div>
  );
}

export function GridTwo({ children }: { children: ReactNode }) {
  return <div className="g2">{children}</div>;
}

export function GridThree({ children }: { children: ReactNode }) {
  return <div className="g3">{children}</div>;
}

export function TableSkeleton() {
  return (
    <div className="stats-row">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stat-c">
          <div style={{ height: 44, width: 44, borderRadius: 12, background: "var(--gray-200)", marginBottom: 12 }} />
          <div style={{ height: 28, width: "50%", background: "var(--gray-200)", marginBottom: 8, borderRadius: 6 }} />
          <div style={{ height: 14, width: "70%", background: "var(--gray-100)", borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );
}
