import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { categories, site } from "~/lib/site";

export const GET: APIRoute = async () => {
  const topics = await getCollection("spec", ({ data }) => !data.draft);
  const lines = [
    "# The Email Specification — checklist",
    "",
    `Source: ${site.url}/checklist/`,
    "",
  ];
  for (const category of categories) {
    lines.push(`## ${category.title}`, "");
    for (const topic of topics
      .filter((entry) => entry.data.category === category.slug)
      .sort((a, b) => a.data.order - b.data.order)) {
      const slug = topic.data.slug ?? topic.id.split("/").pop();
      lines.push(
        `- [ ] **${topic.data.title}** _(${topic.data.status})_ — ${topic.data.summary}`,
        `  ${site.url}/spec/${category.slug}/${slug}/`,
      );
    }
    lines.push("");
  }
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
