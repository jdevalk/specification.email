/**
 * Same-origin tunnel for browser telemetry (Sentry envelopes) to GlitchTip.
 *
 * The destination and project come only from the GLITCHTIP_DSN secret; the
 * request cannot choose either. Each request may carry exactly one error event
 * or one transaction. Rate-limit counters live in D1 under HMAC hashes of the
 * client IP and expire within minutes; if D1 is unavailable, nothing is sent.
 */

interface Env {
  DIAGNOSTICS_ENABLED?: string;
  DIAGNOSTICS_ORIGIN?: string;
  DIAGNOSTICS_HASH_SALT?: string;
  GLITCHTIP_DSN?: string;
  DIAGNOSTICS_DB?: D1Database;
}

const SITE_ORIGIN = "https://specification.email";
const MAX_BYTES = 64 * 1024;
const PER_IP_PER_MINUTE = 20;
const SITE_PER_DAY = 2000;
const UPSTREAM_TIMEOUT_MS = 3000;
const ITEM_CATEGORIES = { event: "error", transaction: "transaction" } as const;

type ItemType = keyof typeof ITEM_CATEGORIES;

class Reject extends Error {
  constructor(
    readonly status: number,
    readonly headers: Record<string, string> = {},
  ) {
    super(String(status));
  }
}

const reply = (status: number, headers: Record<string, string> = {}) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store", ...headers } });

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    return await handle(request, env);
  } catch (error) {
    if (error instanceof Reject) return reply(error.status, error.headers);
    return reply(500);
  }
};

async function handle(request: Request, env: Env): Promise<Response> {
  if (env.DIAGNOSTICS_ENABLED !== "true") throw new Reject(404);
  if (request.method !== "POST") throw new Reject(405, { Allow: "POST" });

  const origin = env.DIAGNOSTICS_ORIGIN || SITE_ORIGIN;
  if (request.headers.get("Origin") !== origin) throw new Reject(403);

  const dsn = parseDsn(env.GLITCHTIP_DSN);
  const db = env.DIAGNOSTICS_DB;
  const salt = env.DIAGNOSTICS_HASH_SALT;
  if (!dsn || !db || !salt) throw new Reject(503);

  const body = await readBody(request);
  const limiter = new Limiter(db);
  const now = Date.now();

  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  const minute = Math.floor(now / 60_000);
  const ipKey = `ip:${await hmac(salt, `${ip}|${minute}`)}`;
  const ipCount = await limiter.hit(ipKey, (minute + 2) * 60);
  if (ipCount > PER_IP_PER_MINUTE) {
    throw new Reject(429, { "Retry-After": String(60 - Math.floor((now / 1000) % 60)) });
  }

  const envelope = parseEnvelope(body, dsn.raw);
  const category = ITEM_CATEGORIES[envelope.type];

  const blockedFor = await limiter.blockedSeconds(category, now);
  if (blockedFor > 0) {
    throw new Reject(429, {
      "Retry-After": String(blockedFor),
      "X-Sentry-Rate-Limits": `${blockedFor}:${category}:organization`,
    });
  }

  const day = new Date(now).toISOString().slice(0, 10);
  const dayEnd = Date.parse(`${day}T00:00:00Z`) / 1000 + 86_400 + 3600;
  const dayCount = await limiter.hit(`day:${day}`, dayEnd);
  if (dayCount > SITE_PER_DAY) {
    throw new Reject(429, {
      "Retry-After": String(Math.max(60, dayEnd - 3600 - now / 1000) | 0),
    });
  }

  return forward(dsn, serialise(envelope), limiter, now);
}

async function readBody(request: Request): Promise<Uint8Array> {
  const declared = Number(request.headers.get("Content-Length") ?? "0");
  if (declared > MAX_BYTES) throw new Reject(413);
  if (!request.body) throw new Reject(400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      throw new Reject(413);
    }
    chunks.push(value);
  }
  if (size === 0) throw new Reject(400);

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

interface Dsn {
  raw: string;
  key: string;
  envelopeUrl: string;
}

function parseDsn(value: string | undefined): Dsn | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const projectId = url.pathname.replace(/^\/+|\/+$/g, "");
    if (!url.username || !/^\d+$/.test(projectId)) return null;
    return {
      raw: value,
      key: url.username,
      envelopeUrl: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
    };
  } catch {
    return null;
  }
}

interface Envelope {
  header: Record<string, unknown>;
  type: ItemType;
  payload: Record<string, unknown>;
}

const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: false });
const encoder = new TextEncoder();
const NEWLINE = 0x0a;

function parseJsonObject(bytes: Uint8Array): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(decoder.decode(bytes));
  } catch {
    throw new Reject(400);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Reject(400);
  return value as Record<string, unknown>;
}

function parseEnvelope(body: Uint8Array, expectedDsn: string): Envelope {
  const headerEnd = body.indexOf(NEWLINE);
  if (headerEnd < 0) throw new Reject(400);
  const header = parseJsonObject(body.subarray(0, headerEnd));
  if (header.dsn !== expectedDsn) throw new Reject(400);

  const itemStart = headerEnd + 1;
  const itemHeaderEnd = body.indexOf(NEWLINE, itemStart);
  if (itemHeaderEnd < 0) throw new Reject(400);
  const itemHeader = parseJsonObject(body.subarray(itemStart, itemHeaderEnd));

  const type = itemHeader.type;
  if (type !== "event" && type !== "transaction") throw new Reject(400);

  const payloadStart = itemHeaderEnd + 1;
  let payloadEnd: number;
  if (itemHeader.length !== undefined) {
    const length = itemHeader.length;
    if (typeof length !== "number" || !Number.isInteger(length) || length < 0) {
      throw new Reject(400);
    }
    payloadEnd = payloadStart + length;
    if (payloadEnd > body.length) throw new Reject(400);
  } else {
    const next = body.indexOf(NEWLINE, payloadStart);
    payloadEnd = next < 0 ? body.length : next;
  }

  // Anything after the single item (other than one trailing newline) is a second item.
  const rest = body.subarray(payloadEnd);
  if (rest.length > 1 || (rest.length === 1 && rest[0] !== NEWLINE)) throw new Reject(400);

  const payload = parseJsonObject(body.subarray(payloadStart, payloadEnd));
  if (type === "transaction" && payload.type !== "transaction") throw new Reject(400);
  if (type === "event" && payload.type !== undefined) throw new Reject(400);
  const eventId = payload.event_id ?? header.event_id;
  if (
    eventId !== undefined &&
    !(typeof eventId === "string" && /^[0-9a-f]{32}$/.test(eventId))
  ) {
    throw new Reject(400);
  }

  return { header, type, payload };
}

const stripQuery = (value: unknown) =>
  typeof value === "string" ? value.replace(/[?#][^\s"']*/g, "") : value;

/** Server-side backstop for the browser scrubbing: personal data never leaves here. */
function scrub(payload: Record<string, unknown>): Record<string, unknown> {
  delete payload.user;
  delete payload.server_name;
  const request = payload.request as Record<string, unknown> | undefined;
  if (request && typeof request === "object") {
    payload.request = { url: stripQuery(request.url) };
  }
  if (typeof payload.transaction === "string")
    payload.transaction = stripQuery(payload.transaction);

  const crumbs = payload.breadcrumbs as { values?: unknown[] } | unknown[] | undefined;
  const list = Array.isArray(crumbs) ? crumbs : crumbs?.values;
  for (const crumb of Array.isArray(list) ? list : []) {
    if (!crumb || typeof crumb !== "object") continue;
    const c = crumb as Record<string, unknown>;
    c.message = stripQuery(c.message);
    const data = c.data as Record<string, unknown> | undefined;
    if (data && typeof data === "object") {
      for (const key of ["url", "from", "to"])
        if (key in data) data[key] = stripQuery(data[key]);
      delete data["http.query"];
      delete data["http.fragment"];
    }
  }

  for (const span of Array.isArray(payload.spans) ? payload.spans : []) {
    if (!span || typeof span !== "object") continue;
    const s = span as Record<string, unknown>;
    s.description = stripQuery(s.description);
    const data = s.data as Record<string, unknown> | undefined;
    if (data && typeof data === "object") {
      for (const key of ["url", "http.url", "url.full"])
        if (key in data) data[key] = stripQuery(data[key]);
      delete data["http.query"];
      delete data["url.query"];
    }
  }
  return payload;
}

function serialise({ header, type, payload }: Envelope): Uint8Array {
  const trace = header.trace as Record<string, unknown> | undefined;
  const cleanHeader = {
    event_id: header.event_id,
    sent_at: header.sent_at,
    dsn: header.dsn,
    sdk: header.sdk,
    trace:
      trace && typeof trace === "object"
        ? { ...trace, transaction: stripQuery(trace.transaction) }
        : undefined,
  };
  const item = encoder.encode(JSON.stringify(scrub(payload)));
  const lines = `${JSON.stringify(cleanHeader)}\n${JSON.stringify({ type, length: item.byteLength })}\n`;
  const head = encoder.encode(lines);
  const out = new Uint8Array(head.byteLength + item.byteLength);
  out.set(head);
  out.set(item, head.byteLength);
  return out;
}

async function forward(
  dsn: Dsn,
  body: Uint8Array,
  limiter: Limiter,
  now: number,
): Promise<Response> {
  let upstream: Response;
  try {
    // A fresh request: no browser cookies, authorisation, or client headers are forwarded.
    upstream = await fetch(dsn.envelopeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${dsn.key}, sentry_client=specification-email-tunnel/1.0`,
      },
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    return reply(timedOut ? 504 : 502);
  }
  await upstream.body?.cancel();

  const passthrough: Record<string, string> = {};
  const sentryLimits = upstream.headers.get("X-Sentry-Rate-Limits");
  const retryAfter = upstream.headers.get("Retry-After");
  if (sentryLimits) passthrough["X-Sentry-Rate-Limits"] = sentryLimits;
  if (retryAfter) passthrough["Retry-After"] = retryAfter;

  const blocks = upstreamBlocks(upstream.status, sentryLimits, retryAfter, now);
  if (blocks.length) {
    try {
      await limiter.block(blocks);
    } catch {
      // The upstream already answered; failing to persist its limit is not a reason to error.
    }
  }

  if (upstream.status >= 200 && upstream.status < 300) return reply(200, passthrough);
  if (upstream.status === 429) return reply(429, passthrough);
  return reply(502);
}

/** Parse Retry-After and X-Sentry-Rate-Limits into per-category block windows. */
function upstreamBlocks(
  status: number,
  sentryLimits: string | null,
  retryAfter: string | null,
  now: number,
): Array<[string, number]> {
  const blocks: Array<[string, number]> = [];
  if (sentryLimits) {
    for (const limit of sentryLimits.split(",")) {
      const [seconds, categories = ""] = limit.trim().split(":");
      const wait = Number.parseInt(seconds ?? "", 10);
      if (!Number.isFinite(wait) || wait <= 0) continue;
      const until = now + wait * 1000;
      const names = categories ? categories.split(";") : ["all"];
      for (const name of names) {
        const category = name === "default" ? "error" : name;
        if (["all", "error", "transaction"].includes(category))
          blocks.push([category, until]);
      }
    }
  } else if (status === 429) {
    let wait = 60;
    if (retryAfter) {
      const seconds = Number(retryAfter);
      const date = Date.parse(retryAfter);
      if (Number.isFinite(seconds)) wait = seconds;
      else if (Number.isFinite(date)) wait = (date - now) / 1000;
    }
    blocks.push(["all", now + Math.max(1, Math.min(wait, 86_400)) * 1000]);
  }
  return blocks;
}

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

let schemaReady = false;

/** D1-backed counters. Every failure propagates, so a broken store blocks sending. */
class Limiter {
  constructor(private readonly db: D1Database) {}

  private async ready() {
    if (schemaReady) return;
    try {
      await this.db.batch([
        this.db.prepare(
          "CREATE TABLE IF NOT EXISTS rate_counters (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL)",
        ),
        this.db.prepare(
          "CREATE INDEX IF NOT EXISTS rate_counters_expiry ON rate_counters (expires_at)",
        ),
        this.db.prepare(
          "CREATE TABLE IF NOT EXISTS upstream_limits (category TEXT PRIMARY KEY, until_ms INTEGER NOT NULL)",
        ),
      ]);
    } catch {
      throw new Reject(503);
    }
    schemaReady = true;
  }

  async hit(key: string, expiresAt: number): Promise<number> {
    await this.ready();
    try {
      const [, result] = await this.db.batch<{ count: number }>([
        this.db
          .prepare("DELETE FROM rate_counters WHERE expires_at < ?")
          .bind(Math.floor(Date.now() / 1000)),
        this.db
          .prepare(
            "INSERT INTO rate_counters (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT (key) DO UPDATE SET count = count + 1 RETURNING count",
          )
          .bind(key, expiresAt),
      ]);
      const count = result?.results?.[0]?.count;
      if (typeof count !== "number") throw new Error("missing count");
      return count;
    } catch {
      throw new Reject(503);
    }
  }

  async blockedSeconds(category: string, now: number): Promise<number> {
    await this.ready();
    try {
      const row = await this.db
        .prepare(
          "SELECT MAX(until_ms) AS until_ms FROM upstream_limits WHERE category IN (?, 'all')",
        )
        .bind(category)
        .first<{ until_ms: number | null }>();
      const until = row?.until_ms ?? 0;
      return until > now ? Math.ceil((until - now) / 1000) : 0;
    } catch {
      throw new Reject(503);
    }
  }

  async block(blocks: Array<[string, number]>) {
    await this.db.batch(
      blocks.map(([category, until]) =>
        this.db
          .prepare(
            "INSERT INTO upstream_limits (category, until_ms) VALUES (?, ?) ON CONFLICT (category) DO UPDATE SET until_ms = MAX(until_ms, excluded.until_ms)",
          )
          .bind(category, until),
      ),
    );
  }
}
