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
    items: changes.map((change) => ({
      title: change.data.title,
      pubDate: new Date(`${change.data.date}T12:00:00Z`),
      description: (change.body ?? "").replace(/\s+/g, " ").trim(),
      link: `/changelog/#${change.id}`,
      content: change.body ?? "",
    })),
    customData: "<language>en</language>",
  });
}
