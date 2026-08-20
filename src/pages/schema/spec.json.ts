import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { site } from "~/lib/site";

export const GET: APIRoute = async () => {
  const topics = await getCollection("spec", ({ data }) => !data.draft);
  const graph = topics.map((topic) => {
    const slug = topic.data.slug ?? topic.id.split("/").pop();
    const url = `${site.url}/spec/${topic.data.category}/${slug}/`;
    return {
      "@type": "TechArticle",
      "@id": `${url}#article`,
      url,
      headline: topic.data.title,
      description: topic.data.summary,
      articleSection: topic.data.category,
      keywords: [topic.data.status, topic.data.category, "email"],
      citation: topic.data.sources.map((source) => source.url),
      isPartOf: { "@id": `${site.url}/#website` },
    };
  });
  return new Response(
    JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2),
    {
      headers: {
        "Content-Type": "application/ld+json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
};
