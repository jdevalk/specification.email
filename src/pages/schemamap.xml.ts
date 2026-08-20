import type { APIRoute } from "astro";
import { site } from "~/lib/site";

export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><schemamap xmlns="https://schema.org/"><schema><loc>${site.url}/schema/spec.json</loc><type>https://schema.org/TechArticle</type></schema></schemamap>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
