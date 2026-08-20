import type { APIRoute } from "astro";
import { site } from "~/lib/site";

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      linkset: [
        { anchor: `${site.url}/schema/spec.json`, type: "https://schema.org/TechArticle" },
        { anchor: `${site.url}/schemamap.xml`, rel: "schemamap" },
        { anchor: `${site.url}/rss.xml`, type: "application/rss+xml" },
        { anchor: site.mcp.endpoint, type: "application/json", rel: "service" },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/linkset+json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
