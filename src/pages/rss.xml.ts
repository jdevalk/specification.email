import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { site } from "~/lib/site";

export async function GET() {
  const changes = (await getCollection("changelog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.localeCompare(a.data.date),
  );
  return rss({
    title: `${site.name} — changelog`,
    description:
      "Additions, corrections, removals, and status changes in the email specification.",
    site: site.url,
    items: changes.map((change) => {
      const body = change.body ?? "";
      return {
        title: change.data.title,
        pubDate: new Date(`${change.data.date}T12:00:00Z`),
        // Plain-text summary: keep link text, drop the Markdown link syntax.
        description: body
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/\s+/g, " ")
          .trim(),
        link: `/changelog/#${change.id}`,
        // Entries link root-relative so they work in dev; feed readers need absolute URLs.
        content: body.replace(/\]\(\//g, `](${site.url}/`),
      };
    }),
    customData: "<language>en</language>",
  });
}
