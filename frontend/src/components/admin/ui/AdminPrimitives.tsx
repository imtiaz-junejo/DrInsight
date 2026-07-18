"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { avatarGradient, hashString, getInitials } from "@/lib/admin-utils";
import { adminUserProfileHref } from "@/lib/admin-routes";

export function UserAvatar({
  firstName,
  lastName,
  seed,
  size = "md",
}: {
  firstName?: string | null;
  lastName?: string | null;
  seed?: string;
  size?: "md" | "sm";
}) {
  const initials = getInitials(firstName, lastName);
  const bg = avatarGradient(hashString(seed ?? `${firstName}${lastName}`));
  const className = size === "sm" ? "sb-av" : "cell-av";

  return (
    <div className={className} style={{ background: bg }}>
      {initials}
    </div>
  );
}

export function StatusChip({ label, className }: { label: string; className: string }) {
  return <span className={`chip ${className}`}>{label}</span>;
}

export function UserCell({
  firstName,
  lastName,
  sub,
  seed,
  userId,
}: {
  firstName?: string | null;
  lastName?: string | null;
  sub?: string;
  seed?: string;
  userId?: string;
}) {
  const content = (
    <div className="cell-user">
      <UserAvatar firstName={firstName} lastName={lastName} seed={seed} />
      <div>
        <div className="cell-name">
          {firstName} {lastName}
        </div>
        {sub ? <div className="cell-sub">{sub}</div> : null}
      </div>
    </div>
  );

  if (userId) {
    return (
      <Link href={adminUserProfileHref(userId)} className="cell-user-link">
        {content}
      </Link>
    );
  }

  return content;
}

export interface StatCardItem {
  ic: string;
  icon: string;
  num: string;
  label: string;
  tag: string;
  tagClass: string;
}

export function StatCardRow({ items }: { items: StatCardItem[] }) {
  return (
    <div className="stats-row">
      {items.map((item) => (
        <div key={item.label} className="stat-c">
          <div className={`stat-ic ${item.ic}`}>{item.icon}</div>
          <strong>{item.num}</strong>
          <span>{item.label}</span>
          <div className={`stat-tag ${item.tagClass}`}>{item.tag}</div>
        </div>
      ))}
    </div>
  );
}

export function AdminPanel({
  title,
  actions,
  children,
  bodyClassName,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div className="panel">
      <div className="panel-hd">
        <h3>{title}</h3>
        {actions ? <div className="btn-row">{actions}</div> : null}
      </div>
      {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
    </div>
  );
}

export function AdminTable({
  headers,
  rows,
  emptyMessage = "No records found",
  loading = false,
}: {
  headers: string[];
  rows: ReactNode[][];
  emptyMessage?: string;
  loading?: boolean;
}) {
  return (
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="admin-empty-row">
              <td colSpan={headers.length}>Loading...</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr className="admin-empty-row">
              <td colSpan={headers.length}>{emptyMessage}</td>
            </tr>
          ) : (
            rows.map((cells, index) => (
              <tr key={index}>
                {cells.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PanelTable({
  title,
  actions,
  headers,
  rows,
  pagerInfo,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage,
  loading,
}: {
  title: string;
  actions?: ReactNode;
  headers: string[];
  rows: ReactNode[][];
  pagerInfo?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  loading?: boolean;
}) {
  return (
    <AdminPanel title={title} actions={actions}>
      <AdminTable headers={headers} rows={rows} emptyMessage={emptyMessage} loading={loading} />
      {pagerInfo ? (
        <AdminPagination info={pagerInfo} page={page} totalPages={totalPages} onPageChange={onPageChange} />
      ) : null}
    </AdminPanel>
  );
}

export function AdminPagination({
  info,
  page = 1,
  totalPages = 1,
  onPageChange,
}: {
  info: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const pages = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);

  return (
    <div className="pager">
      <span>{info}</span>
      <div className="pager-btns">
        <button type="button" className="pager-btn" onClick={() => onPageChange?.(Math.max(1, page - 1))}>
          ←
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`pager-btn${p === page ? " on" : ""}`}
            onClick={() => onPageChange?.(p)}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="pager-btn"
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
        >
          →
        </button>
      </div>
    </div>
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
    <div className="flt-row">
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

export function BarChart({
  data,
  valueSuffix = "",
  barStyle,
}: {
  data: Array<{ label: string; value: number; display?: string }>;
  valueSuffix?: string;
  barStyle?: React.CSSProperties;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="chart-bars">
      {data.map((item) => (
        <div key={item.label} className="cb-wrap">
          <div className="cb-val">
            {item.display ?? `${item.value}${valueSuffix}`}
          </div>
          <div className="cb-bar" style={{ height: `${(item.value / max) * 100}%`, ...barStyle }} />
          <div className="cb-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function AdminButton({
  children,
  variant,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "danger" | "green";
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const classes = ["btn", variant].filter(Boolean).join(" ");
  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

export function ToggleSwitch({
  checked,
  defaultChecked,
  onChange,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="slider" />
    </label>
  );
}

export function GridTwo({ children }: { children: ReactNode }) {
  return <div className="grid2">{children}</div>;
}

export function KvGrid({ items }: { items: Array<{ value: string; label: string }> }) {
  return (
    <div className="kv-grid">
      {items.map((item) => (
        <div key={item.label} className="kv-card">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="pbar">
      <div className="pbar-fill" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}

export function PanelLink({ children, onClick, href }: { children: ReactNode; onClick?: () => void; href?: string }) {
  if (href) {
    return (
      <a className="panel-link" href={href}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className="panel-link" onClick={onClick}>
      {children}
    </button>
  );
}

export function ToggleRow({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions: ReactNode;
}) {
  return (
    <div className="toggle-row">
      <div className="toggle-info">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <div className="btn-row">{actions}</div>
    </div>
  );
}

export function TemplateItem({
  icon,
  iconBg,
  title,
  subtitle,
  actions,
}: {
  icon: string;
  iconBg?: string;
  title: string;
  subtitle: string;
  actions: ReactNode;
}) {
  return (
    <div className="tpl-item">
      <div className="tpl-ic" style={iconBg ? { background: iconBg } : { background: "var(--blue-light)" }}>
        {icon}
      </div>
      <div className="tpl-info">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <div className="btn-row">{actions}</div>
    </div>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="form-grid">{children}</div>;
}

export function FormItem({
  label,
  children,
  full,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`fg-item${full ? " full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

export function TableSkeleton({ cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="stats-row">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="stat-c">
          <div className="admin-skeleton" style={{ height: 42, width: 42, marginBottom: 10 }} />
          <div className="admin-skeleton" style={{ height: 28, width: "60%", marginBottom: 8 }} />
          <div className="admin-skeleton" style={{ height: 14, width: "40%" }} />
        </div>
      ))}
    </div>
  );
}
