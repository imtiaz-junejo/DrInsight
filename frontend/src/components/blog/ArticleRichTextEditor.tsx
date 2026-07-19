"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";

const RTE_CALLOUTS: Record<string, { head: string; text: string }> = {
  warning: { head: "⚠️ Red Flag / Warning", text: "Describe the warning sign or red-flag symptom here." },
  tip: { head: "✅ Clinical Tip", text: "Add a practical clinical tip here." },
  takeaway: { head: "📌 Key Takeaway", text: "Summarise the key takeaway here." },
  research: { head: "🔬 Research Note", text: "Cite the study or research finding here." },
  medication: { head: "💊 Medication Note", text: "Add prescribing / medication guidance here." },
};

export type ArticleRichTextEditorHandle = {
  getHtml: () => string;
  setHtml: (html: string) => void;
  focus: () => void;
};

type ArticleRichTextEditorProps = {
  onChange?: () => void;
};

export const ArticleRichTextEditor = forwardRef<ArticleRichTextEditorHandle, ArticleRichTextEditorProps>(
  function ArticleRichTextEditor({ onChange }, ref) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);

    const updateWordCount = useCallback(() => {
      const text = editorRef.current?.innerText ?? "";
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
      setCharCount(text.length);
      onChange?.();
    }, [onChange]);

    const execFmt = useCallback(
      (cmd: string, val?: string) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, val ?? undefined);
        updateWordCount();
      },
      [updateWordCount],
    );

    const insertHtml = useCallback(
      (html: string) => {
        editorRef.current?.focus();
        document.execCommand("insertHTML", false, html);
        updateWordCount();
      },
      [updateWordCount],
    );

    const insertLink = () => {
      const url = window.prompt("Enter URL:", "https://");
      if (url) execFmt("createLink", url);
    };

    const insertTable = () => {
      const rows = parseInt(window.prompt("Number of rows:", "3") || "3", 10);
      const cols = parseInt(window.prompt("Number of columns:", "3") || "3", 10);
      if (!rows || !cols) return;
      let html = '<div class="data-table-wrap"><table class="data-table"><thead><tr>';
      for (let c = 0; c < cols; c++) html += `<th>Column ${c + 1}</th>`;
      html += "</tr></thead><tbody>";
      for (let r = 0; r < rows - 1; r++) {
        html += "<tr>";
        for (let c = 0; c < cols; c++) html += "<td>Cell</td>";
        html += "</tr>";
      }
      html += "</tbody></table></div><p></p>";
      insertHtml(html);
    };

    const insertQuote = () => {
      insertHtml("<blockquote>Your clinical quote or key finding here</blockquote><p></p>");
    };

    const insertHr = () => {
      insertHtml("<hr><p></p>");
    };

    const insertCallout = (type: string) => {
      const c = RTE_CALLOUTS[type];
      if (!c) return;
      insertHtml(
        `<div class="callout callout-${type}"><div class="callout-head">${c.head}</div><p>${c.text}</p></div><p></p>`,
      );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        execFmt("indent");
      }
    };

    useImperativeHandle(ref, () => ({
      getHtml: () => editorRef.current?.innerHTML.trim() ?? "",
      setHtml: (html: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = html;
          updateWordCount();
        }
      },
      focus: () => editorRef.current?.focus(),
    }));

    return (
      <div className="rte-wrap">
        <div className="rte-toolbar">
          <div className="rte-tb-group">
            <select
              className="rte-select"
              defaultValue=""
              title="Heading"
              onChange={(e) => {
                if (e.target.value) execFmt("formatBlock", e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Paragraph</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
            </select>
          </div>
          <div className="rte-tb-group">
            <button type="button" className="rte-btn" title="Bold" onClick={() => execFmt("bold")}>
              <strong>B</strong>
            </button>
            <button type="button" className="rte-btn" title="Italic" onClick={() => execFmt("italic")}>
              <em>I</em>
            </button>
            <button type="button" className="rte-btn" title="Underline" onClick={() => execFmt("underline")}>
              <u>U</u>
            </button>
            <button type="button" className="rte-btn" title="Strikethrough" onClick={() => execFmt("strikeThrough")}>
              <s>S</s>
            </button>
          </div>
          <div className="rte-tb-group">
            <button type="button" className="rte-btn" title="Align Left" onClick={() => execFmt("justifyLeft")}>
              ≡L
            </button>
            <button type="button" className="rte-btn" title="Center" onClick={() => execFmt("justifyCenter")}>
              ≡C
            </button>
            <button type="button" className="rte-btn" title="Align Right" onClick={() => execFmt("justifyRight")}>
              ≡R
            </button>
          </div>
          <div className="rte-tb-group">
            <button type="button" className="rte-btn" title="Bullet List" onClick={() => execFmt("insertUnorderedList")}>
              • List
            </button>
            <button type="button" className="rte-btn" title="Numbered List" onClick={() => execFmt("insertOrderedList")}>
              1. List
            </button>
            <button type="button" className="rte-btn" title="Indent" onClick={() => execFmt("indent")}>
              → In
            </button>
            <button type="button" className="rte-btn" title="Outdent" onClick={() => execFmt("outdent")}>
              ← Out
            </button>
          </div>
          <div className="rte-tb-group">
            <input
              type="color"
              className="rte-color"
              title="Font Color"
              defaultValue="#334155"
              onChange={(e) => execFmt("foreColor", e.target.value)}
            />
            <button type="button" className="rte-btn" title="Clear Formatting" onClick={() => execFmt("removeFormat")}>
              ✕ Clear
            </button>
          </div>
          <div className="rte-tb-group">
            <button type="button" className="rte-btn" title="Insert Link" onClick={insertLink}>
              🔗 Link
            </button>
            <button type="button" className="rte-btn" title="Insert Table" onClick={insertTable}>
              ⊞ Table
            </button>
            <button type="button" className="rte-btn" title="Blockquote" onClick={insertQuote}>
              ❝ Quote
            </button>
            <button type="button" className="rte-btn" title="Divider" onClick={insertHr}>
              ─ HR
            </button>
          </div>
          <div className="rte-tb-group" title="Insert a colored callout box — same style as the public article page">
            <button
              type="button"
              className="rte-btn rte-callout-btn rte-cb-warning"
              title="Warning callout"
              onClick={() => insertCallout("warning")}
            >
              ⚠️ Warn
            </button>
            <button
              type="button"
              className="rte-btn rte-callout-btn rte-cb-tip"
              title="Tip callout"
              onClick={() => insertCallout("tip")}
            >
              ✅ Tip
            </button>
            <button
              type="button"
              className="rte-btn rte-callout-btn rte-cb-takeaway"
              title="Takeaway callout"
              onClick={() => insertCallout("takeaway")}
            >
              📌 Note
            </button>
            <button
              type="button"
              className="rte-btn rte-callout-btn rte-cb-research"
              title="Research callout"
              onClick={() => insertCallout("research")}
            >
              🔬 Study
            </button>
            <button
              type="button"
              className="rte-btn rte-callout-btn rte-cb-medication"
              title="Medication callout"
              onClick={() => insertCallout("medication")}
            >
              💊 Med
            </button>
          </div>
          <div className="rte-tb-group">
            <button type="button" className="rte-btn" title="Undo" onClick={() => document.execCommand("undo")}>
              ↩ Undo
            </button>
            <button type="button" className="rte-btn" title="Redo" onClick={() => document.execCommand("redo")}>
              ↪ Redo
            </button>
          </div>
          <div className="rte-tb-group rte-wordcount-wrap">
            <span className="rte-wc-label">
              Words: <strong>{wordCount}</strong>
            </span>
          </div>
        </div>
        <div
          ref={editorRef}
          className="rte-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={updateWordCount}
          onKeyDown={handleKeyDown}
          placeholder="Start writing your full article here. Use the toolbar above to format headings, bold text, bullet lists, and more..."
        />
        <div className="rte-footer">
          <span style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>
            💡 Tip: Use Heading 2 for main sections, Heading 3 for subsections. Add clinical bullet points and references
            inline.
          </span>
          <span style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>{charCount} characters</span>
        </div>
      </div>
    );
  },
);
