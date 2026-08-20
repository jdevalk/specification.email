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

const card = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#21152f"/>
      <stop offset="1" stop-color="#6d28d9"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <circle cx="1050" cy="70" r="330" fill="#a78bfa" opacity=".16"/>
  <g transform="translate(84 82)">
    <rect width="88" height="88" rx="18" fill="#fff"/>
    <rect x="18" y="26" width="52" height="38" rx="6" fill="none" stroke="#6d28d9" stroke-width="7"/>
    <path d="m22 31 22 17 22-17" fill="none" stroke="#6d28d9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="84" y="238" fill="#c4b5fd" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="4">THE EMAIL SPECIFICATION</text>
  <text x="84" y="350" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="700" letter-spacing="-3">What a good email does.</text>
  <text x="84" y="430" fill="#ede9fe" font-family="Arial, Helvetica, sans-serif" font-size="32">Standards for reliable, accessible, secure email.</text>
  <text x="84" y="574" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">specification.email</text>
</svg>`;

await sharp(Buffer.from(card))
  .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
  .toFile(fileURLToPath(new URL("../public/og-default.jpg", import.meta.url)));

console.log("✓ generated favicon, app icons, and 1200×675 social card");
