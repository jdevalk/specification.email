// Social cards use the same bundled Archivo fonts as the site. Sharp/Pango
// measures the real glyphs, so long titles wrap without estimated character counts.
import sharp from "sharp";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fonts = fileURLToPath(new URL("../public/fonts/", import.meta.url));
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
// Use only the checked-in fonts, independent of the host's installed fonts.
const fontCache = mkdtempSync(join(tmpdir(), "spec-og-fonts-"));
const fontConfig = join(fontCache, "fonts.conf");
writeFileSync(
  fontConfig,
  `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><dir>${escape(fonts)}</dir><cachedir>${escape(fontCache)}</cachedir></fontconfig>`,
);
process.env.FONTCONFIG_FILE = fontConfig;
process.once("exit", () => rmSync(fontCache, { recursive: true, force: true }));

const palettes = {
  website: {
    paper: "#f0f7f1",
    ink: "#102416",
    muted: "#4b5b4e",
    rule: "#b5c4b5",
    accent: "#00672c",
    deep: "#102c1e",
    signal: "#b0e777",
  },
  email: {
    paper: "#f6f3fb",
    ink: "#231b30",
    muted: "#574c64",
    rule: "#c2bbcd",
    accent: "#63369a",
    deep: "#2a1c3c",
    signal: "#d4b8f7",
  },
};

async function textLayer(text, { x, y, width, height, size = 28, bold = false, color }) {
  // Keep every word: shrink a long title or summary until its measured height fits.
  for (let current = size; current >= 18; current -= 2) {
    const result = await sharp({
      text: {
        text: `<span foreground="${color}">${escape(text)}</span>`,
        font: `Archivo ${bold ? "ExtraBold" : "Regular"} ${current}`,
        fontfile: join(fonts, bold ? "archivo-extrabold.ttf" : "archivo-regular.ttf"),
        width,
        wrap: "word-char",
        rgba: true,
        dpi: 72,
      },
    })
      .png()
      .toBuffer({ resolveWithObject: true });
    if (result.info.height <= height) return { input: result.data, left: x, top: y };
  }
  throw new Error(`Social card text does not fit: ${text}`);
}

export async function renderOgCard({
  site = "website",
  title,
  summary = "",
  label = "",
  footnote = "",
  home = false,
}) {
  const p = palettes[site];
  const brand = `The ${site === "email" ? "Email" : "Website"} Specification`;
  const layers = [];
  const add = async (text, options) =>
    layers.push(await textLayer(text, { color: p.ink, ...options }));
  const mark =
    site === "website"
      ? '<path d="m71 71 7 15 6-10 6 10 10-23"/>'
      : '<rect x="72" y="68" width="26" height="19"/><path d="m73 69 12 9 12-9"/>';
  const background = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
    <rect width="1200" height="675" fill="${p.paper}"/>
    <rect x="64" y="56" width="44" height="44" fill="${p.accent}"/>
    <g fill="none" stroke="${p.paper}" stroke-width="3" stroke-linejoin="round">${mark}</g>
    <path d="M64 128H1136" stroke="${p.ink}" stroke-width="3"/>
    <path d="M64 574H1136" stroke="${p.rule}" stroke-width="2"/>
    ${home ? `<rect x="820" y="172" width="316" height="350" fill="${p.deep}"/><path d="M848 234H1108M848 302H1108M848 370H1108M848 438H1108" stroke="${p.signal}" stroke-opacity=".35"/>` : ""}
    <path d="M1108 616l24-24m-24 0h24v24" fill="none" stroke="${p.accent}" stroke-width="4"/>
  </svg>`;
  await add(brand, { x: 124, y: 64, width: 850, height: 42, size: 28, bold: true });
  if (home) {
    await add("What a good", {
      x: 64,
      y: 187,
      width: 724,
      height: 110,
      size: 92,
      bold: true,
    });
    await add(`${site} does.`, {
      x: 64,
      y: 294,
      width: 724,
      height: 110,
      size: 92,
      bold: true,
      color: p.accent,
    });
    await add(summary, { x: 64, y: 430, width: 680, height: 96, size: 29, color: p.muted });
    await add("Every detail counts.", {
      x: 848,
      y: 196,
      width: 260,
      height: 30,
      size: 23,
      bold: true,
      color: p.signal,
    });
    const rows =
      site === "email"
        ? ["The message", "The delivery", "The experience", "The relationship"]
        : ["The document", "The experience", "The trust", "The discovery"];
    for (const [i, row] of rows.entries()) {
      await add(row, {
        x: 848,
        y: 260 + i * 68,
        width: 260,
        height: 35,
        size: 25,
        bold: true,
        color: p.paper,
      });
    }
  } else {
    await add(title, { x: 64, y: 182, width: 1072, height: 226, size: 82, bold: true });
    await add(summary, {
      x: 64,
      y: 430,
      width: 1040,
      height: 106,
      size: 28,
      color: p.muted,
    });
  }
  await add(`specification.${site}`, {
    x: 64,
    y: 604,
    width: 450,
    height: 36,
    size: 25,
    bold: true,
    color: p.accent,
  });
  const detail = home ? footnote : [label, footnote].filter(Boolean).join(" · ");
  if (detail)
    await add(detail, { x: 520, y: 604, width: 550, height: 36, size: 22, color: p.muted });
  return sharp(Buffer.from(background))
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toBuffer();
}
