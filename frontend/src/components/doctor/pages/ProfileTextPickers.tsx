"use client";

import { useCallback, useRef, type ReactNode } from "react";

export const BOARD_CERT_ICONS = ["🏥", "✅", "🧠", "❤️", "🦋", "🩺", "🎓", "🌍", "💊", "⚕️", "📋", "🏛️"] as const;

export const AWARD_ICONS = ["🥇", "🥈", "🥉", "🌟", "🎖️", "🏆", "🔬", "🎗️"] as const;

export const LECTURE_TYPES = ["Conference", "Grand Rounds", "Webinar", "Teaching", "Lecture"] as const;

export function ProfileIconPicker({
  icons,
  hint,
  onInsert,
  mutedIconBorder,
}: {
  icons: readonly string[];
  hint: string;
  onInsert: (icon: string) => void;
  mutedIconBorder?: boolean;
}) {
  return (
    <div className={`dp-text-picker${mutedIconBorder ? " dp-text-picker-icons-200" : ""}`}>
      <span className="dp-text-picker-label">Icon:</span>
      {icons.map((icon) => (
        <button
          key={icon}
          type="button"
          className="dp-text-picker-icon"
          title={`Insert ${icon}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onInsert(icon)}
        >
          {icon}
        </button>
      ))}
      <span className="dp-text-picker-hint">tap to insert at the cursor, then type {hint}</span>
    </div>
  );
}

export function ProfileTypePicker({
  types,
  onInsert,
}: {
  types: readonly string[];
  onInsert: (line: string) => void;
}) {
  return (
    <div className="dp-text-picker">
      <span className="dp-text-picker-label">Type:</span>
      {types.map((type) => (
        <button
          key={type}
          type="button"
          className="dp-text-picker-type"
          title={`Insert a templated ${type} line`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onInsert(`Talk Title|Venue|${type}|2026`)}
        >
          {type}
        </button>
      ))}
      <span className="dp-text-picker-hint">tap a type to insert at the cursor, then edit it</span>
    </div>
  );
}

export function ProfilePipeTextArea({
  value,
  onChange,
  rows = 4,
  picker,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  picker: (insertAtCursor: (text: string) => void) => ReactNode;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        onChange(`${value}${text}`);
        return;
      }

      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? value.length;
      const next = `${value.slice(0, start)}${text}${value.slice(end)}`;
      const cursor = start + text.length;

      onChange(next);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursor, cursor);
      });
    },
    [onChange, value],
  );

  return (
    <>
      {picker(insertAtCursor)}
      <textarea ref={textareaRef} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </>
  );
}
