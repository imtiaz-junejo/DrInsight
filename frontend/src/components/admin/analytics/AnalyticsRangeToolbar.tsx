"use client";

import { useState } from "react";
import { AdminButton, FilterPills } from "@/components/admin/ui/AdminPrimitives";
import {
  ANALYTICS_RANGE_OPTIONS,
  type AnalyticsRangeParams,
  rangeIndexFromKey,
  rangeKeyFromIndex,
} from "@/lib/analytics-range";

export function AnalyticsRangeToolbar({
  value,
  onChange,
  onExport,
  exportLabel = "Export CSV",
}: {
  value: AnalyticsRangeParams;
  onChange: (next: AnalyticsRangeParams) => void;
  onExport?: () => void;
  exportLabel?: string;
}) {
  const [customFrom, setCustomFrom] = useState(value.from ?? "");
  const [customTo, setCustomTo] = useState(value.to ?? "");
  const activeIndex = rangeIndexFromKey(value.range);

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="btn-row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <FilterPills
          filters={[...ANALYTICS_RANGE_OPTIONS]}
          activeIndex={activeIndex}
          onChange={(index) => {
            const range = rangeKeyFromIndex(index);
            onChange({ range, from: customFrom || undefined, to: customTo || undefined });
          }}
        />
        {onExport ? <AdminButton onClick={onExport}>{exportLabel}</AdminButton> : null}
      </div>
      {value.range === "custom" ? (
        <div className="form-grid" style={{ marginTop: 12, maxWidth: 520 }}>
          <div className="fg-item">
            <label>From</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                onChange({ range: "custom", from: e.target.value, to: customTo || undefined });
              }}
            />
          </div>
          <div className="fg-item">
            <label>To</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                onChange({ range: "custom", from: customFrom || undefined, to: e.target.value });
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
