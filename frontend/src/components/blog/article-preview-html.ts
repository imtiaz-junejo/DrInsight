export type ArticlePreviewData = {
  title: string;
  subtitle: string;
  spec: string;
  type: string;
  audience: string;
  read: string;
  tags: string;
  published: string;
  heroIcon: string;
  authorName: string;
  authorCreds: string;
  authorRole: string;
  abstract: string;
  body: string;
  points: string;
  ref: string;
};

function escHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtPubDate(value: string): string {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function artInitials(name: string): string {
  const parts = String(name || "")
    .trim()
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return `${parts[0][0] || ""}${parts.length > 1 ? parts[parts.length - 1][0] : ""}`.toUpperCase();
}

function pubLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function buildArticlePreviewHtml(d: ArticlePreviewData): string {
  const tags = (d.tags || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const tagHtml = tags.length
    ? `<div class="tag-row">${tags.map((t) => `<span class="spec-tag">${escHtml(t)}</span>`).join("")}</div>`
    : "";
  const meta = (icon: string, label: string, value: string) =>
    value?.trim() ? `<div class="meta-item">${icon} <strong>${label}:</strong> ${escHtml(value)}</div>` : "";
  const metaRow =
    meta("📅", "Published", fmtPubDate(d.published)) +
    meta("📄", "Type", d.type) +
    meta("👥", "Audience", d.audience);
  const points = pubLines(d.points);
  const summaryInner = points.length
    ? `<ul>${points.map((p) => `<li>${escHtml(p)}</li>`).join("")}</ul>`
    : d.abstract?.trim()
      ? `<p>${escHtml(d.abstract)}</p>`
      : "";
  const summaryBox =
    points.length || d.abstract?.trim()
      ? `<div class="summary-box"><h4>📋 Quick Summary</h4>${summaryInner}</div>`
      : "";
  const abstractPara =
    d.abstract?.trim() && points.length ? `<div class="prose"><p>${escHtml(d.abstract)}</p></div>` : "";
  const authorCard = `<div class="author-row" style="grid-template-columns:1fr"><div class="author-card">` +
    `<div class="author-av" style="background:linear-gradient(135deg,#7c3aed,#4a90d9)">${artInitials(d.authorName)}</div><div>` +
    `<div class="author-label">Written by</div><div class="author-name">${escHtml(d.authorName || "Author")}</div>` +
    (d.authorCreds ? `<div class="author-creds">${escHtml(d.authorCreds)}</div>` : "") +
    (d.authorRole ? `<div class="author-role">${escHtml(d.authorRole)}</div>` : "") +
    `</div></div></div>`;
  const bodyInner = d.body?.replace(/<[^>]*>/g, "").trim() ? `<div class="prose">${d.body}</div>` : "";
  const keyTakeaways = points.length
    ? `<div class="key-takeaways"><h3>🎯 Key Takeaways</h3><ul>${points.map((p) => `<li>${escHtml(p)}</li>`).join("")}</ul></div>`
    : "";
  const refBox = d.ref?.trim()
    ? `<div class="references"><h3>📚 References &amp; Sources</h3><div class="ref-list"><div class="ref-item"><span>1.</span> ${escHtml(d.ref)}</div></div></div>`
    : "";

  return (
    `<div class="artpub">` +
    `<div class="article-header">` +
    `<div class="header-top">` +
    `<span class="cat-badge clinical">🩺 ${d.spec ? escHtml(d.spec) : "Clinical"}</span>` +
    (d.read ? `<div class="reading-time">⏱ ${escHtml(d.read)} min read</div>` : "") +
    `</div>` +
    `<h1 class="article-title">${d.title ? escHtml(d.title) : "Untitled article"}</h1>` +
    (d.subtitle ? `<p class="article-subtitle">${escHtml(d.subtitle)}</p>` : "") +
    tagHtml +
    (metaRow ? `<div class="meta-row">${metaRow}</div>` : "") +
    `</div>` +
    `<div class="author-block">${authorCard}</div>` +
    `<div class="hero-img"><div class="hero-img-inner">${d.heroIcon || "🩺"}</div></div>` +
    summaryBox +
    abstractPara +
    bodyInner +
    keyTakeaways +
    refBox +
    `</div>`
  );
}
