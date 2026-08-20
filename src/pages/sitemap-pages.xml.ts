import type { APIRoute } from "astro";
import { site } from "~/lib/site";

const pages = [
  "/",
  "/spec/",
  "/checklist/",
  "/changelog/",
  "/considered/",
  "/about/",
  "/mcp/",
  "/search/",
];
export const GET: APIRoute = () => {
  const urls = pages
    .map((path) => `<url><loc>${new URL(path, site.url).href}</loc></url>`)
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
