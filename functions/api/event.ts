export const onRequest: PagesFunction = async ({ request }) => {
  const responseHeaders = { "Cache-Control": "no-store" };
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      headers: { ...responseHeaders, Allow: "POST" },
    });
  }
  if (request.headers.get("Origin") !== "https://specification.email") {
    return new Response(null, { status: 403, headers: responseHeaders });
  }

  // Use Cloudflare's visitor IP, never a client-supplied forwarding header.
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) {
    return new Response(null, { status: 400, headers: responseHeaders });
  }
  const headers = new Headers({ "X-Forwarded-For": ip });
  for (const name of ["Content-Type", "User-Agent"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    // Fresh headers keep site cookies and credentials out of the upstream request.
    const upstream = await fetch("https://plausible.io/api/event", {
      method: "POST",
      headers,
      body: request.body,
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
    const retryAfter = upstream.headers.get("Retry-After");
    const resultHeaders = new Headers(responseHeaders);
    if (retryAfter) resultHeaders.set("Retry-After", retryAfter);
    return new Response(null, {
      status: upstream.status,
      headers: resultHeaders,
    });
  } catch (error) {
    console.error("Plausible event proxy failed", String(error));
    return new Response(null, { status: 502, headers: responseHeaders });
  }
};
