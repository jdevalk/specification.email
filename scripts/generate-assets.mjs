import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { renderOgCard } from "./og-card.mjs";
import { glob } from "node:fs/promises";
import { parse } from "yaml";
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

// ---- Homepage social card, matching the purple field-guide identity ----
let topicCount = 0;
const categorySlugs = new Set();
for await (const path of glob("src/content/spec/**/*.md", {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
})) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (frontmatter && !parse(frontmatter[1]).draft) {
    topicCount++;
    categorySlugs.add(path.split("/").at(-2));
  }
}
const card = await renderOgCard({
  site: "email",
  home: true,
  summary:
    "A field guide to email that arrives, works for everyone, and earns its place in the inbox.",
  footnote: `${topicCount} topics · ${categorySlugs.size} areas`,
});
await sharp(card)
  .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
  .toFile(fileURLToPath(new URL("../public/og-default.jpg", import.meta.url)));
console.log("✓ generated favicon, app icons, and 1200×675 social card");
