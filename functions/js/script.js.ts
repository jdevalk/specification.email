const SCRIPT_URL = "https://plausible.io/js/pa-I1I9vqcv36EL957gGy5_P.js";

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  try {
    const upstream = await fetch(SCRIPT_URL, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      cf: { cacheTtlByStatus: { "200-299": 3600, "300-599": -1 } },
    });
    if (!upstream.ok) {
      console.error("Plausible script upstream status", upstream.status);
      return new Response(null, {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return new Response(request.method === "HEAD" ? null : upstream.body, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Plausible script proxy failed", String(error));
    return new Response(null, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
};
