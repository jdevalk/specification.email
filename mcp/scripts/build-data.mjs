import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = join(here, "..", "..");
const specRoot = join(root, "src", "content", "spec");
const changelogRoot = join(root, "src", "content", "changelog");
const categories = JSON.parse(
  await readFile(join(root, "src", "data", "categories.json"), "utf8"),
);
const output = join(here, "..", "src", "data.json");
const site = "https://specification.email";

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.isFile() && entry.name.endsWith(".md")) yield path;
  }
}
function parse(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Missing frontmatter");
  return { data: parseYaml(match[1]), body: match[2].trim() };
}

const topics = [];
for await (const file of walk(specRoot)) {
  const { data, body } = parse(await readFile(file, "utf8"));
  if (data.draft) continue;
  const rel = relative(specRoot, file).replace(/\\/g, "/");
  const category = data.category ?? rel.split("/")[0];
  const slug = data.slug ?? rel.split("/").pop().replace(/\.md$/, "");
  topics.push({
    slug,
    category,
    title: data.title,
    summary: data.summary,
    status: data.status,
    order: data.order ?? 100,
    sources: data.sources ?? [],
    url: `${site}/spec/${category}/${slug}/`,
    mdUrl: `${site}/spec/${category}/${slug}.md`,
    body,
  });
}
topics.sort(
  (a, b) =>
    categories.find((category) => category.slug === a.category).order -
      categories.find((category) => category.slug === b.category).order ||
    a.order - b.order ||
    a.title.localeCompare(b.title),
);

const changelog = [];
for await (const file of walk(changelogRoot)) {
  const { data, body } = parse(await readFile(file, "utf8"));
  if (!data.draft)
    changelog.push({
      title: data.title,
      date: data.date,
      type: data.type ?? "changed",
      relatedSlugs: data.relatedSlugs ?? [],
      body,
    });
}
changelog.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : new Date().toISOString();
await writeFile(
  output,
  JSON.stringify({ generatedAt, site, categories, topics, changelog }, null, 2),
);
console.log(
  `✓ wrote ${relative(here, output)} — ${topics.length} topics, ${changelog.length} changes`,
);
