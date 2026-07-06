import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoDir = path.join(__dirname, "../public/assets/logo");
const faviconDir = path.join(logoDir, "favicons");

const FAVICON_SIZES = [16, 32, 48, 180, 192, 512];
const CORNER_RADIUS_RATIO = 0.18;
const FAVICON_CONTENT_SCALE = 0.86;

async function trimPadding(sourcePath) {
  const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const isWhitespace = a < 20 || (r > 235 && g > 235 && b > 235);
      if (!isWhitespace) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return sharp(sourcePath).extract({
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  });
}

function roundedMask(size, radius) {
  const r = Math.max(2, Math.round(radius));
  const svg = `<svg width="${size}" height="${size}">
    <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="white"/>
  </svg>`;
  return Buffer.from(svg);
}

async function buildFavicons() {
  fs.mkdirSync(faviconDir, { recursive: true });

  const sourcePath = path.join(logoDir, "favicon.png");
  const trimmed = await trimPadding(sourcePath);
  const trimmedBuffer = await trimmed.png().toBuffer();
  const trimmedMeta = await sharp(trimmedBuffer).metadata();

  const contentScale = FAVICON_CONTENT_SCALE;
  const outputs = [];

  for (const size of FAVICON_SIZES) {
    const radius = Math.round(size * CORNER_RADIUS_RATIO);
    const inner = Math.max(1, Math.round(size * contentScale));
    const offset = Math.round((size - inner) / 2);

    const icon = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: await sharp(trimmedBuffer)
            .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer(),
          left: offset,
          top: offset,
        },
      ])
      .png()
      .toBuffer();

    const rounded = await sharp(icon)
      .composite([{ input: roundedMask(size, radius), blend: "dest-in" }])
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();

    const fileName = `favicon-${size}x${size}.png`;
    const filePath = path.join(faviconDir, fileName);
    fs.writeFileSync(filePath, rounded);
    outputs.push({ size, fileName });
  }

  const primary = path.join(faviconDir, "favicon-32x32.png");
  fs.copyFileSync(primary, path.join(faviconDir, "favicon.png"));

  return { trimmedMeta, outputs };
}

async function buildHeaderLogoDisplay() {
  const sourcePath = path.join(logoDir, "header-logo.png");
  const trimmed = await trimPadding(sourcePath);
  const outputPath = path.join(logoDir, "header-logo-display.png");
  await trimmed.png().toFile(outputPath);
  const meta = await sharp(outputPath).metadata();
  return { outputPath, meta };
}

async function sampleFooterBackground() {
  const footerPath = path.join(logoDir, "footer-logo.png");
  const { data, info } = await sharp(footerPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const samples = [];
  const w = info.width;
  const h = info.height;
  const points = [
    [2, 2],
    [w - 3, 2],
    [2, h - 3],
    [w - 3, h - 3],
    [Math.floor(w / 2), 2],
    [Math.floor(w / 2), h - 3],
    [2, Math.floor(h / 2)],
    [w - 3, Math.floor(h / 2)],
  ];

  for (const [x, y] of points) {
    const i = (y * w + x) * info.channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = info.channels === 4 ? data[i + 3] : 255;
    if (a > 200) samples.push([r, g, b]);
  }

  const border = await sharp(footerPath)
    .extract({ left: 0, top: 0, width: w, height: Math.min(8, h) })
    .resize(64, 8, { fit: "fill" })
    .raw()
    .toBuffer();

  for (let i = 0; i < border.length; i += 3) {
    samples.push([border[i], border[i + 1], border[i + 2]]);
  }

  const buckets = new Map();
  for (const [r, g, b] of samples) {
    const key = `${Math.round(r / 4) * 4},${Math.round(g / 4) * 4},${Math.round(b / 4) * 4}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const dominant = [...buckets.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const [r, g, b] = dominant.split(",").map(Number);
  const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

  const topBand = await sharp(footerPath)
    .extract({ left: 0, top: 0, width: (await sharp(footerPath).metadata()).width, height: 12 })
    .raw()
    .toBuffer();

  const topBuckets = new Map();
  for (let i = 0; i < topBand.length; i += 3) {
    const rr = topBand[i];
    const gg = topBand[i + 1];
    const bb = topBand[i + 2];
    const key = `${rr},${gg},${bb}`;
    topBuckets.set(key, (topBuckets.get(key) ?? 0) + 1);
  }

  const topDominant = [...topBuckets.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const [tr, tg, tb] = topDominant.split(",").map(Number);
  const topHex = `#${[tr, tg, tb].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

  return { hex: topHex, rgb: [tr, tg, tb], cornerHex: hex };
}

const favicons = await buildFavicons();
const headerLogo = await buildHeaderLogoDisplay();
const footerColor = await sampleFooterBackground();

console.log(JSON.stringify({ favicons, headerLogo, footerColor }, null, 2));
