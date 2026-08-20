import { mkdir, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { parse as parseYaml } from "yaml";

const root = new URL("..", import.meta.url).pathname;
const contentRoot = join(root, "src/content/spec");
const dist = join(root, "dist");
const okfRoot = join(dist, "okf");

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

await rm(okfRoot, { recursive: true, force: true });
const entries = [];
for await (const file of walk(contentRoot)) {
  const { data, body } = parse(await readFile(file, "utf8"));
  if (data.draft) continue;
  const rel = relative(contentRoot, file).replace(/\\/g, "/");
  const category = data.category ?? rel.split("/")[0];
  const slug = data.slug ?? rel.split("/").pop().replace(/\.md$/, "");
  const canonical = `https://specification.email/spec/${category}/${slug}/`;
  entries.push({ data, body, category, slug, canonical });
  const target = join(okfRoot, "spec", category, `${slug}.md`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(
    target,
    `---\ntype: https://schema.org/TechArticle\ncanonical: ${canonical}\nstatus: ${data.status}\n---\n\n# ${data.title}\n\n> ${data.summary}\n\n${body}\n`,
  );
}
entries.sort((a, b) => a.category.localeCompare(b.category) || a.data.order - b.data.order);
const full = [
  "# The Email Specification",
  "",
  "> A platform-agnostic specification of what reliable, accessible, secure email does.",
  "",
  ...entries.flatMap((entry) => [
    `## ${entry.data.title}`,
    "",
    `Canonical: ${entry.canonical}`,
    `Status: ${entry.data.status}`,
    "",
    entry.body,
    "",
  ]),
].join("\n");
await writeFile(join(dist, "llms-full.txt"), full);
await writeFile(
  join(okfRoot, "README.md"),
  "# The Email Specification OKF bundle\n\nTyped Markdown concepts generated from the canonical source corpus.\n",
);
execFileSync("tar", ["-czf", join(dist, "okf.tar.gz"), "-C", dist, "okf"]);
console.log(`✓ generated llms-full.txt and OKF bundle from ${entries.length} topics`);
