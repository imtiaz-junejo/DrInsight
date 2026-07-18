"use client";

import { useEffect, useRef } from "react";

export function DoctorRichTextEditor({
  value,
  onChange,
  placeholder = "Write clinical notes here...",
  minHeight = 160,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const wordCount = value.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">
        <div className="rte-tb-group">
          <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}>
            <b>B</b>
          </button>
          <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}>
            <i>I</i>
          </button>
          <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}>
            <u>U</u>
          </button>
        </div>
        <div className="rte-tb-group">
          <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")}>
            • List
          </button>
          <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")}>
            1. List
          </button>
        </div>
        <div className="rte-tb-group">
          <button
            type="button"
            className="rte-btn"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const url = window.prompt("Enter URL");
              if (url) exec("createLink", url);
            }}
          >
            Link
          </button>
          <button type="button" className="rte-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("formatBlock", "blockquote")}>
            Quote
          </button>
        </div>
        <div className="rte-tb-group rte-wordcount-wrap">
          <span className="rte-wc-label">{wordCount} words</span>
        </div>
      </div>
      <div
        ref={editorRef}
        className="rte-editor"
        style={{ minHeight }}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
      />
    </div>
  );
}
