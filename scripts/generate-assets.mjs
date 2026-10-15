import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const favicon = await readFile(new URL("../public/favicon.svg", import.meta.url));
const renderIcon = (size) => sharp(favicon).resize(size, size).png().toBuffer();
const [icon16, icon32, icon192, icon512] = await Promise.all([
  renderIcon(16),
  renderIcon(32),
  renderIcon(192),
  renderIcon(512),
]);

await Promise.all([
  writeFile(
    new URL("../public/favicon.ico", import.meta.url),
    await pngToIco([icon16, icon32]),
  ),
  writeFile(new URL("../public/apple-touch-icon.png", import.meta.url), icon192),
  writeFile(new URL("../public/icon-192.png", import.meta.url), icon192),
  writeFile(new URL("../public/icon-512.png", import.meta.url), icon512),
]);

// ---- Homepage social card (1200×675) ----
// Checklist motif shared with specification.website's card, in this site's
// violet identity. Type is the site's Inter (falls back to system-ui).

const FONT_SANS = "Inter, ui-sans-serif, system-ui, sans-serif";
const FONT_MONO = "ui-monospace, Menlo, Consolas, monospace";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Violet checkbox (or empty box) centred on (cx, cy).
const checkBox = (cx, cy, size, checked = true) => {
  const x = cx - size / 2;
  const y = cy - size / 2;
  if (!checked) {
    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="7" fill="none" stroke="#7c6aa0" stroke-width="2.5"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="7" fill="#a78bfa"/>
    <path d="M ${x + size * 0.24} ${cy} L ${x + size * 0.44} ${y + size * 0.7} L ${x + size * 0.76} ${y + size * 0.3}"
      fill="none" stroke="#231031" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const cardSamples = [
  ["SPF", "DKIM", "DMARC"],
  ["STARTTLS", "Alt text", "One-click unsubscribe"],
];
const cardMore = 28; // 34 spec topics total, 6 sampled above
const cardCols = [80, 425, 770];
const cardRows = [404, 460];

const cardChecklist = cardSamples
  .map((labels, r) =>
    labels
      .map(
        (label, c) => `
    ${checkBox(cardCols[c] + 15, cardRows[r] - 11, 30, true)}
    <text x="${cardCols[c] + 46}" y="${cardRows[r]}" font-family="${FONT_SANS}" font-weight="600" font-size="28" fill="#ffffff">${esc(label)}</text>`,
      )
      .join("\n"),
  )
  .join("\n");

const card = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="The Email Specification — What a good email does.">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c0e30"/>
      <stop offset="0.55" stop-color="#241040"/>
      <stop offset="1" stop-color="#341457"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.88" cy="0.08" r="0.55">
      <stop offset="0" stop-color="#7c3aed" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.05" cy="1" r="0.5">
      <stop offset="0" stop-color="#4c1d95" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#4c1d95" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#glow)"/>
  <rect width="1200" height="675" fill="url(#glow2)"/>
  <rect x="0" y="0" width="12" height="675" fill="#a78bfa"/>
  <g transform="translate(80 76)">
    <rect width="88" height="88" rx="18" fill="#fff"/>
    <rect x="18" y="26" width="52" height="38" rx="6" fill="none" stroke="#6d28d9" stroke-width="7"/>
    <path d="m22 31 22 17 22-17" fill="none" stroke="#6d28d9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <g transform="translate(184 108)" font-family="${FONT_SANS}">
    <text x="0" y="0" font-size="26" font-weight="700" fill="#ffffff" letter-spacing="-0.3">The Email Specification</text>
    <text x="0" y="30" font-size="19" font-weight="500" fill="#c4b5fd">What a good email does.</text>
  </g>
  <text x="80" y="300" font-family="${FONT_SANS}" font-size="52" font-weight="800" letter-spacing="-1.8" fill="#ffffff">The open checklist for the inbox.</text>
  <g font-family="${FONT_SANS}">
${cardChecklist}
    ${checkBox(95, 505, 30, false)}
    <text x="126" y="516" font-size="28" font-weight="500" fill="#c4b5fd">… and ${cardMore} more topics on the list.</text>
  </g>
  <g font-family="${FONT_MONO}" font-size="22" fill="#8f83a8">
    <text x="80" y="622">specification.email</text>
    <text x="1120" y="622" text-anchor="end">MIT · CC BY 4.0</text>
  </g>
</svg>`;

await sharp(Buffer.from(card))
  .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
  .toFile(fileURLToPath(new URL("../public/og-default.jpg", import.meta.url)));

console.log("✓ generated favicon, app icons, and 1200×675 social card");
