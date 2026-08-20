import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { categories, site } from "~/lib/site";

export function getStaticPaths() {
  return categories.map((category) => ({ params: { category: category.slug } }));
}
export const GET: APIRoute = async ({ params }) => {
  const topics = await getCollection(
    "spec",
    ({ data }) => !data.draft && data.category === params.category,
  );
  const paths = [
    `/spec/${params.category}/`,
    ...topics.map(
      (topic) =>
        `/spec/${params.category}/${topic.data.slug ?? topic.id.split("/").pop()}/`,
    ),
  ];
  const urls = paths
    .map((path) => `<url><loc>${new URL(path, site.url).href}</loc></url>`)
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
