"use client";

import {
  buildAvailabilityFooter,
  buildAvailabilityRows,
  type DayScheduleConfig,
} from "@/lib/author-schedule";

interface Props {
  id: string;
  title: string;
  config: DayScheduleConfig;
  syncNote: string;
}

export function AuthorAvailabilitySidebarCard({ id, title, config, syncNote }: Props) {
  const rows = buildAvailabilityRows(config);
  const footerLines = [...buildAvailabilityFooter(config), syncNote];

  return (
    <div className="sidebar-card" id={id}>
      <div className="sb-title">{title}</div>
      {rows.map((day) => (
        <div key={day.day} className="avail-row">
          <span className="avail-day">
            {day.available ? <span className="avail-dot dot-g" aria-hidden /> : null}
            {day.day}
          </span>
          <span className={`avail-time${day.available ? "" : " closed"}`}>{day.time}</span>
        </div>
      ))}
      <div className="avail-footer">
        {footerLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}
