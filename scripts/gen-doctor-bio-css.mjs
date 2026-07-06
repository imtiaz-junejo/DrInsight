import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "doctor-author-bio-page.html"), "utf8");
const start = html.indexOf("<style>") + 7;
const end = html.indexOf("</style>");
let css = html.slice(start, end);

for (const block of [
  "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}",
  "html{scroll-behavior:smooth}",
  "body{font-family:var(--font-body);color:var(--gray-800);background:#fff;font-size:15px;line-height:1.65}",
  "a{color:inherit;text-decoration:none}",
  "ul{list-style:none}",
]) {
  css = css.replace(block, "");
}

let i = css.indexOf("/* ── TOP BAR");
let j = css.indexOf("/* ── BREADCRUMB");
if (i !== -1 && j !== -1) css = css.slice(0, i) + css.slice(j);

i = css.indexOf("/* ── FOOTER");
j = css.indexOf("/* ── RESPONSIVE");
if (i !== -1 && j !== -1) css = css.slice(0, i) + css.slice(j);

css = css.replace(/\/\*[\s\S]*?\*\//g, "");

const rootMatch = css.match(/:root\{([^}]*)\}/);
let varsBody = rootMatch ? rootMatch[1] : "";
css = css.replace(/:root\{[^}]*\}/, "");
varsBody = varsBody
  .replace("'Playfair Display',Georgia,serif", 'var(--font-playfair), "Playfair Display", Georgia, serif')
  .replace("'DM Sans',system-ui,sans-serif", 'var(--font-dm-sans), "DM Sans", system-ui, sans-serif');

function scopeBlock(block) {
  const out = [];
  for (const part of block.split("}")) {
    const trimmed = part.trim();
    if (!trimmed || !trimmed.includes("{")) continue;
    const [selRaw, ...bodyParts] = trimmed.split("{");
    const body = bodyParts.join("{");
    const sels = selRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith(".doctor-bio-page") ? s : `.doctor-bio-page ${s}`));
    out.push(`${sels.join(", ")} {${body}}`);
  }
  return out.join("\n");
}

const result = [];
let pos = 0;
const mediaRe = /@media[^{]+\{/g;
let media;
while ((media = mediaRe.exec(css))) {
  result.push(scopeBlock(css.slice(pos, media.index)));
  let startI = media.index + media[0].length;
  let depth = 1;
  let k = startI;
  while (k < css.length && depth) {
    if (css[k] === "{") depth += 1;
    else if (css[k] === "}") depth -= 1;
    k += 1;
  }
  const mediaSel = media[0].slice(0, -1).trim();
  const inner = css.slice(startI, k - 1);
  result.push(`${mediaSel} {`);
  result.push(scopeBlock(inner));
  result.push("}");
  pos = k;
  mediaRe.lastIndex = k;
}
result.push(scopeBlock(css.slice(pos)));
let scoped = result.join("\n");

for (const pattern of [
  /\.doctor-bio-page \.nav-links\{[^}]*\}/g,
  /\.doctor-bio-page \.hamburger\{[^}]*\}/g,
  /\.doctor-bio-page \.mobile-menu\.open\{[^}]*\}/g,
  /\.doctor-bio-page \.footer-grid\{[^}]*\}/g,
  /\.doctor-bio-page \.footer-bottom\{[^}]*\}/g,
]) {
  scoped = scoped.replace(pattern, "");
}

const header = `.doctor-bio-page {
${varsBody}
  font-family: var(--font-body);
  color: var(--gray-800);
  background: #fff;
  font-size: 15px;
  line-height: 1.65;
}
.doctor-bio-page a { color: inherit; text-decoration: none; }
.doctor-bio-page ul { list-style: none; margin: 0; padding: 0; }
.doctor-bio-page button { font-family: inherit; }
.doctor-bio-page .hero-photo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.doctor-bio-page .hero-photo.has-img { font-size: 0; overflow: hidden; }
.doctor-bio-page .empty-state { text-align: center; padding: 28px 16px; color: var(--gray-500); font-size: .88rem; }
.doctor-bio-page .page-loading,
.doctor-bio-page .page-error { max-width: 640px; margin: 48px auto; padding: 32px 24px; text-align: center; }
.doctor-bio-page .page-error h2 { font-family: var(--font-display); color: var(--gray-900); margin-bottom: 8px; }
.doctor-bio-page .page-error p { color: var(--gray-500); margin-bottom: 16px; }
.doctor-bio-page .page-error a { color: var(--blue); font-weight: 600; }
.doctor-bio-page .load-more-soft {
  background: var(--blue-light);
  color: var(--blue);
  border: 1.5px solid #bfdbfe;
  padding: 10px 24px;
  border-radius: 50px;
  font-size: .86rem;
  font-weight: 700;
  cursor: pointer;
}
.doctor-bio-page .verified-box {
  background: #f0fdf4;
  border: 1px solid #a7f3d0;
  border-radius: var(--radius);
  padding: 14px 16px;
  margin-top: 16px;
}
.doctor-bio-page .coi-box {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  padding: 14px 16px;
}
.doctor-bio-page .role-links { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
.doctor-bio-page .role-link {
  font-size: .76rem;
  font-weight: 600;
  color: var(--blue);
  background: var(--blue-light);
  padding: 6px 14px;
  border-radius: 8px;
}
.doctor-bio-page .role-link.danger {
  color: var(--red);
  background: #fef2f2;
}
`;

const outPath = path.join(root, "frontend", "src", "styles", "doctor-bio-page.css");
fs.writeFileSync(outPath, `${header}\n${scoped}`);
console.log(`wrote ${outPath} (${fs.statSync(outPath).size} bytes)`);
