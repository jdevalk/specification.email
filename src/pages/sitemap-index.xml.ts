import type { APIRoute } from "astro";
import { categories, site } from "~/lib/site";

export const GET: APIRoute = () => {
  const locations = ["pages", ...categories.map((category) => category.slug)]
    .map((name) => `<sitemap><loc>${site.url}/sitemap-${name}.xml</loc></sitemap>`)
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations}</sitemapindex>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
