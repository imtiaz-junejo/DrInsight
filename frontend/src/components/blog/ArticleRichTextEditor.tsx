"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

const TABLE_GRID_SIZE = 10;

const RTE_CALLOUTS: Record<string, { head: string; text: string }> = {
  warning: { head: "⚠️ Red Flag / Warning", text: "Describe the warning sign or red-flag symptom here." },
  tip: { head: "✅ Clinical Tip", text: "Add a practical clinical tip here." },
  takeaway: { head: "📌 Key Takeaway", text: "Summarise the key takeaway here." },
  research: { head: "🔬 Research Note", text: "Cite the study or research finding here." },
  medication: { head: "💊 Medication Note", text: "Add prescribing / medication guidance here." },
};

function getCalloutAncestor(node: Node | null, root: HTMLElement): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== root) {
    if (current instanceof HTMLElement && current.classList.contains("callout")) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

function createTrailingParagraph() {
  const paragraph = document.createElement("p");
  paragraph.appendChild(document.createElement("br"));
  return paragraph;
}

function createCalloutElement(type: string) {
  const callout = RTE_CALLOUTS[type];
  const element = document.createElement("div");
  element.className = `callout callout-${type}`;
  element.innerHTML = `<div class="callout-head">${callout.head}</div><p>${callout.text}</p>`;
  return element;
}

function placeCaretIn(element: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function isCaretAtEndOfCallout(callout: HTMLElement, range: Range) {
  const tail = document.createRange();
  tail.selectNodeContents(callout);
  tail.setStart(range.endContainer, range.endOffset);
  return tail.toString().replace(/\u00a0/g, " ").trim().length === 0;
}

function buildTableHtml(rows: number, cols: number): string {
  let html = '<div class="data-table-wrap"><table class="data-table"><thead><tr>';
  for (let c = 0; c < cols; c++) html += `<th>Column ${c + 1}</th>`;
  html += "</tr></thead><tbody>";
  for (let r = 0; r < rows - 1; r++) {
    html += "<tr>";
    for (let c = 0; c < cols; c++) html += "<td>Cell</td>";
    html += "</tr>";
  }
  html += "</tbody></table></div><p></p>";
  return html;
}

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
    const tablePickerRef = useRef<HTMLDivElement>(null);
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [fontColor, setFontColor] = useState("#334155");
    const [tablePickerOpen, setTablePickerOpen] = useState(false);
    const [tableHover, setTableHover] = useState({ rows: 0, cols: 0 });

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

    const insertTableWithSize = useCallback(
      (rows: number, cols: number) => {
        if (!rows || !cols) return;
        insertHtml(buildTableHtml(rows, cols));
        setTablePickerOpen(false);
        setTableHover({ rows: 0, cols: 0 });
      },
      [insertHtml],
    );

    useEffect(() => {
      if (!tablePickerOpen) return;

      const onDocumentMouseDown = (event: MouseEvent) => {
        if (tablePickerRef.current?.contains(event.target as Node)) return;
        setTablePickerOpen(false);
        setTableHover({ rows: 0, cols: 0 });
      };

      document.addEventListener("mousedown", onDocumentMouseDown);
      return () => document.removeEventListener("mousedown", onDocumentMouseDown);
    }, [tablePickerOpen]);

    const insertQuote = () => {
      insertHtml("<blockquote>Your clinical quote or key finding here</blockquote><p></p>");
    };

    const insertHr = () => {
      insertHtml("<hr><p></p>");
    };

    const insertCallout = (type: string) => {
      const editor = editorRef.current;
      if (!editor || !RTE_CALLOUTS[type]) return;

      editor.focus();
      const callout = createCalloutElement(type);
      const trailing = createTrailingParagraph();
      const selection = window.getSelection();
      const insideCallout = getCalloutAncestor(selection?.anchorNode ?? null, editor);

      if (insideCallout) {
        insideCallout.insertAdjacentElement("afterend", callout);
        callout.insertAdjacentElement("afterend", trailing);
      } else if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.collapse(false);
        const fragment = document.createDocumentFragment();
        fragment.appendChild(callout);
        fragment.appendChild(trailing);
        range.insertNode(fragment);
      } else {
        editor.appendChild(callout);
        editor.appendChild(trailing);
      }

      placeCaretIn(trailing);
      updateWordCount();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        execFmt("indent");
        return;
      }

      if (e.key !== "Enter" || e.shiftKey) return;

      const editor = editorRef.current;
      if (!editor) return;

      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      const callout = getCalloutAncestor(selection.anchorNode, editor);
      if (!callout) return;

      const range = selection.getRangeAt(0);
      if (!isCaretAtEndOfCallout(callout, range)) return;

      e.preventDefault();

      let next: HTMLElement;
      const sibling = callout.nextElementSibling;
      if (sibling instanceof HTMLElement && sibling.tagName === "P") {
        next = sibling;
      } else {
        next = createTrailingParagraph();
        callout.insertAdjacentElement("afterend", next);
      }

      placeCaretIn(next);
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
            <div className="rte-color-wrap">
              <button
                type="button"
                className="rte-color-trigger border border-gray-300"
                title="Font Color"
                onClick={() => colorInputRef.current?.click()}
              >
                <img src="/assets/icons/rte-color-picker.png" alt="" className="rte-color-icon" />
              </button>
              <input
                ref={colorInputRef}
                type="color"
                className="rte-color-input"
                value={fontColor}
                onChange={(e) => {
                  setFontColor(e.target.value);
                  execFmt("foreColor", e.target.value);
                }}
              />
            </div>
            <button type="button" className="rte-btn rte-clear-btn" title="Clear Formatting" onClick={() => execFmt("removeFormat")}>
              <span className="rte-clear-icon" aria-hidden="true">
                ✕
              </span>
              Clear
            </button>
          </div>
          <div className="rte-tb-group">
            <button type="button" className="rte-btn" title="Insert Link" onClick={insertLink}>
              🔗 Link
            </button>
            <div className="rte-table-picker-wrap" ref={tablePickerRef}>
              <button
                type="button"
                className={`rte-btn${tablePickerOpen ? " active" : ""}`}
                title="Insert Table"
                onClick={() => {
                  setTablePickerOpen((open) => !open);
                  setTableHover({ rows: 0, cols: 0 });
                }}
              >
                ⊞ Table
              </button>
              {tablePickerOpen && (
                <div className="rte-table-picker border border-gray-400" onMouseLeave={() => setTableHover({ rows: 0, cols: 0 })}>
                  <div className="rte-table-picker-label">
                    {tableHover.rows > 0 && tableHover.cols > 0
                      ? `${tableHover.cols}×${tableHover.rows} Table`
                      : "Insert Table"}
                  </div>
                  <div className="rte-table-picker-grid" role="grid" aria-label="Select table size">
                    {Array.from({ length: TABLE_GRID_SIZE }, (_, row) =>
                      Array.from({ length: TABLE_GRID_SIZE }, (_, col) => {
                        const isSelected = row < tableHover.rows && col < tableHover.cols;
                        return (
                          <button
                            key={`${row}-${col}`}
                            type="button"
                            className={`rte-table-picker-cell border border-gray-400${isSelected ? " selected" : ""}`}
                            onMouseEnter={() => setTableHover({ rows: row + 1, cols: col + 1 })}
                            onClick={() => insertTableWithSize(row + 1, col + 1)}
                            aria-label={`Insert ${col + 1} column by ${row + 1} row table`}
                          />
                        );
                      }),
                    )}
                  </div>
                </div>
              )}
            </div>
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
          data-placeholder="Start writing your full article here. Use the toolbar above to format headings, bold text, bullet lists, and more..."
        />
        <div className="rte-footer">
          <span style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>
            💡 Tip: Press Enter at the end of a callout to exit it. New callout cards are always added below the current one.
          </span>
          <span style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>{charCount} characters</span>
        </div>
      </div>
    );
  },
);
