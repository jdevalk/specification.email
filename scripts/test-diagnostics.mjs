// End-to-end tests for functions/api/diagnostics.ts.
// Runs `wrangler pages dev` against a local D1 and a mock GlitchTip upstream.
// Usage: npm run diagnostics:test
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const PORT = 8790;
const ORIGIN = `http://localhost:${PORT}`;
const KEY = "0123456789abcdef0123456789abcdef";
const work = mkdtempSync(join(tmpdir(), "diag-test-"));
const site = join(work, "site");
const persist = join(work, "state");
mkdirSync(site);
writeFileSync(join(site, "index.html"), "<!doctype html><title>t</title>");

// ---- Mock upstream -------------------------------------------------------
const upstream = { requests: [], mode: "ok", redirectHits: 0 };
const mock = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (req.url === "/redirected") {
    upstream.redirectHits++;
    return res.writeHead(200).end("followed");
  }
  upstream.requests.push({
    url: req.url,
    headers: req.headers,
    body: Buffer.concat(chunks).toString(),
  });
  const mode = upstream.mode;
  if (mode === "redirect")
    return res
      .writeHead(302, { Location: `http://127.0.0.1:${mockPort}/redirected` })
      .end();
  if (mode === "slow") return setTimeout(() => res.writeHead(200).end("late"), 5000);
  if (mode === "limit") {
    return res
      .writeHead(429, {
        "Retry-After": "60",
        "X-Sentry-Rate-Limits": "60:transaction:organization",
      })
      .end("upstream-secret-body");
  }
  res
    .writeHead(200, { "Content-Type": "application/json" })
    .end('{"id":"upstream-secret-body"}');
});
await new Promise((resolve) => mock.listen(0, "127.0.0.1", resolve));
const mockPort = mock.address().port;
const DSN = `http://${KEY}@127.0.0.1:${mockPort}/7`;

// ---- Proxy under test ----------------------------------------------------
function startProxy(extra = [], enabled = "true") {
  const child = spawn(
    "npx",
    [
      "wrangler",
      "pages",
      "dev",
      site,
      "--port",
      String(PORT),
      "--persist-to",
      persist,
      "--binding",
      `DIAGNOSTICS_ENABLED=${enabled}`,
      "--binding",
      `DIAGNOSTICS_ORIGIN=${ORIGIN}`,
      "--binding",
      `GLITCHTIP_DSN=${DSN}`,
      "--binding",
      "DIAGNOSTICS_HASH_SALT=test-salt",
      ...extra,
    ],
    { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, CI: "1" } },
  );
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  child.log = () => log;
  return child;
}

async function waitUp() {
  for (let i = 0; i < 120; i++) {
    try {
      await fetch(`${ORIGIN}/`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error("proxy did not start");
}

async function stop(child) {
  child.kill("SIGTERM");
  await new Promise((r) => child.once("exit", r));
}

const post = (body, headers = {}) =>
  fetch(`${ORIGIN}/api/diagnostics`, {
    method: "POST",
    headers: { Origin: ORIGIN, "Content-Type": "text/plain;charset=UTF-8", ...headers },
    body,
  });

const id = () => crypto.randomUUID().replaceAll("-", "");
const envelope = (items, dsn = DSN) => {
  const eventId = id();
  return [
    JSON.stringify({ event_id: eventId, dsn, sent_at: new Date().toISOString() }),
    ...items,
  ].join("\n");
};
const eventItem = (extra = {}) => {
  const payload = JSON.stringify({
    event_id: id(),
    platform: "javascript",
    exception: { values: [{ type: "Error", value: "test" }] },
    user: { email: "someone@example.com", ip_address: "203.0.113.9" },
    request: {
      url: "https://specification.email/spec/?token=abc#frag",
      headers: { Cookie: "a=b", Authorization: "Bearer x", "User-Agent": "UA" },
      cookies: { a: "b" },
      data: "secret body",
      query_string: "token=abc",
    },
    breadcrumbs: {
      values: [{ category: "fetch", data: { url: "/x?email=a@b.c", method: "GET" } }],
    },
    ...extra,
  });
  return `${JSON.stringify({ type: "event" })}\n${payload}`;
};
const transactionItem = () => {
  const payload = JSON.stringify({
    event_id: id(),
    type: "transaction",
    transaction: "/spec/?q=1",
    start_timestamp: Date.now() / 1000 - 1,
    timestamp: Date.now() / 1000,
    contexts: { trace: { trace_id: id(), span_id: id().slice(0, 16), op: "pageload" } },
    spans: [{ description: "GET /data.json?user=me", data: { url: "/data.json?user=me" } }],
  });
  return `${JSON.stringify({ type: "transaction", length: Buffer.byteLength(payload) })}\n${payload}`;
};

const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push(["ok", name]);
    console.log(`ok   ${name}`);
  } catch (error) {
    results.push(["FAIL", name]);
    console.log(`FAIL ${name}\n     ${error.message}`);
  }
}

const expectStatus = async (responsePromise, status) => {
  const res = await responsePromise;
  const text = await res.text();
  assert.equal(res.status, status, `expected ${status}, got ${res.status}`);
  assert.equal(text, "", "response body must be empty");
  return res;
};

let proxy = startProxy(["--d1", "DIAGNOSTICS_DB=diag-local"]);
try {
  await waitUp();

  await test("rejects GET with 405", async () => {
    const res = await expectStatus(
      fetch(`${ORIGIN}/api/diagnostics`, { headers: { Origin: ORIGIN } }),
      405,
    );
    assert.equal(res.headers.get("Allow"), "POST");
  });
  await test("rejects foreign Origin", () =>
    expectStatus(post(envelope([eventItem()]), { Origin: "https://evil.example" }), 403));
  await test("rejects missing Origin", () =>
    expectStatus(
      fetch(`${ORIGIN}/api/diagnostics`, { method: "POST", body: envelope([eventItem()]) }),
      403,
    ));
  await test("rejects lookalike Origin", () =>
    expectStatus(post(envelope([eventItem()]), { Origin: `${ORIGIN}.evil.example` }), 403));
  await test("rejects bodies over 64 KB", () =>
    expectStatus(
      post(envelope([eventItem({ extra: { pad: "x".repeat(70 * 1024) } })])),
      413,
    ));
  await test("rejects chunked bodies over 64 KB", () => {
    const big = new TextEncoder().encode("x".repeat(70 * 1024));
    const stream = new ReadableStream({
      start(c) {
        c.enqueue(big);
        c.close();
      },
    });
    return expectStatus(
      fetch(`${ORIGIN}/api/diagnostics`, {
        method: "POST",
        headers: { Origin: ORIGIN },
        body: stream,
        duplex: "half",
      }),
      413,
    );
  });

  // Requests that pass Origin and size checks count against the per-IP minute limit,
  // so keep this block short and run the limit test in a fresh minute below.
  const sent = upstream.requests.length;
  await test("rejects non-JSON", () => expectStatus(post("not an envelope"), 400));
  await test("rejects foreign DSN", () =>
    expectStatus(
      post(envelope([eventItem()], `http://${"f".repeat(32)}@127.0.0.1:${mockPort}/8`)),
      400,
    ));
  await test("rejects envelope without DSN", () =>
    expectStatus(post(`{"event_id":"${id()}"}\n${eventItem()}`), 400));
  await test("rejects multiple items", () =>
    expectStatus(post(envelope([eventItem(), eventItem()])), 400));
  await test("rejects attachments", () =>
    expectStatus(
      post(
        envelope([JSON.stringify({ type: "attachment", length: 3, filename: "a" }), "abc"]),
      ),
      400,
    ));
  await test("rejects sessions", () =>
    expectStatus(
      post(envelope([JSON.stringify({ type: "session" }), '{"sid":"x","status":"ok"}'])),
      400,
    ));
  await test("rejects replays", () =>
    expectStatus(
      post(envelope([JSON.stringify({ type: "replay_event" }), '{"type":"replay_event"}'])),
      400,
    ));
  await test("rejects wrong length", () =>
    expectStatus(
      post(envelope([JSON.stringify({ type: "event", length: 9999 }), '{"a":1}'])),
      400,
    ));
  await test("rejects event item carrying a transaction", () =>
    expectStatus(post(envelope([eventItem({ type: "transaction" })])), 400));
  await test("nothing invalid reached upstream", () =>
    assert.equal(upstream.requests.length, sent));

  await test("forwards a scrubbed error event", async () => {
    const res = await expectStatus(
      post(envelope([eventItem()]), {
        Cookie: "session=1",
        Authorization: "Bearer browser",
      }),
      200,
    );
    assert.equal(res.headers.get("set-cookie"), null);
    const last = upstream.requests.at(-1);
    assert.equal(last.url, "/api/7/envelope/");
    assert.equal(last.headers.cookie, undefined);
    assert.equal(last.headers.authorization, undefined);
    assert.match(last.headers["x-sentry-auth"], new RegExp(`sentry_key=${KEY}`));
    for (const leak of [
      "someone@example.com",
      "203.0.113.9",
      "token=abc",
      "Bearer",
      "secret body",
      "email=a@b.c",
      "#frag",
    ]) {
      assert.ok(!last.body.includes(leak), `upstream body leaked ${leak}`);
    }
    const [, itemHeader, payload] = last.body.split("\n");
    assert.equal(JSON.parse(itemHeader).length, Buffer.byteLength(payload));
  });
  await test("forwards a scrubbed transaction", async () => {
    await expectStatus(post(envelope([transactionItem()])), 200);
    const last = upstream.requests.at(-1);
    assert.ok(!last.body.includes("user=me") && !last.body.includes("q=1"), "query leaked");
  });

  upstream.mode = "redirect";
  await test("does not follow upstream redirects", async () => {
    await expectStatus(post(envelope([eventItem()])), 502);
    assert.equal(upstream.redirectHits, 0);
  });

  upstream.mode = "slow";
  await test("times out upstream after 3 seconds", async () => {
    const start = Date.now();
    await expectStatus(post(envelope([eventItem()])), 504);
    const took = Date.now() - start;
    assert.ok(took >= 2800 && took < 4800, `took ${took} ms`);
  });

  upstream.mode = "limit";
  await test("passes upstream 429 headers without body", async () => {
    const res = await expectStatus(post(envelope([transactionItem()])), 429);
    assert.equal(res.headers.get("Retry-After"), "60");
    assert.equal(res.headers.get("X-Sentry-Rate-Limits"), "60:transaction:organization");
  });
  upstream.mode = "ok";
  await test("honours X-Sentry-Rate-Limits for that category only", async () => {
    const before = upstream.requests.length;
    const res = await expectStatus(post(envelope([transactionItem()])), 429);
    assert.ok(Number(res.headers.get("Retry-After")) > 0);
    assert.equal(upstream.requests.length, before, "blocked transaction reached upstream");
    await expectStatus(post(envelope([eventItem()])), 200);
  });

  const d1 = (sql) =>
    execFileSync(
      "npx",
      [
        "wrangler",
        "d1",
        "execute",
        "DIAGNOSTICS_DB",
        "--local",
        "--persist-to",
        persist,
        "--json",
        "--command",
        sql,
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], cwd: work },
    );
  writeFileSync(
    join(work, "wrangler.json"),
    JSON.stringify({
      name: "t",
      d1_databases: [
        {
          binding: "DIAGNOSTICS_DB",
          database_name: "diag-local",
          database_id: "diag-local",
        },
      ],
    }),
  );

  await test("stores only hashed IPs", () => {
    const rows = JSON.parse(d1("SELECT key FROM rate_counters"))[0].results;
    assert.ok(rows.length > 0, "no counters stored");
    for (const { key } of rows) {
      assert.match(key, /^(ip:[0-9a-f]{64}|day:\d{4}-\d{2}-\d{2})$/);
      assert.ok(!key.includes("127.0.0.1") && !key.includes("::1"));
    }
  });

  // Wait for a fresh minute so earlier requests do not count.
  await new Promise((r) => setTimeout(r, 60_000 - (Date.now() % 60_000) + 500));
  await test("limits 20 requests per minute per IP", async () => {
    const statuses = [];
    for (let i = 0; i < 22; i++) {
      const res = await post(envelope([eventItem()]));
      await res.text();
      statuses.push(res.status);
    }
    assert.deepEqual(statuses.slice(0, 20), Array(20).fill(200));
    assert.deepEqual(statuses.slice(20), [429, 429]);
  });

  await new Promise((r) => setTimeout(r, 60_000 - (Date.now() % 60_000) + 500));
  await test("limits 2000 requests per day for the site", async () => {
    const day = new Date().toISOString().slice(0, 10);
    d1(`UPDATE rate_counters SET count = 2000 WHERE key = 'day:${day}'`);
    const before = upstream.requests.length;
    const res = await expectStatus(post(envelope([eventItem()])), 429);
    assert.ok(Number(res.headers.get("Retry-After")) >= 60);
    assert.equal(upstream.requests.length, before);
  });

  await test("fails closed when the limit store breaks", async () => {
    d1("DROP TABLE rate_counters");
    const before = upstream.requests.length;
    await expectStatus(post(envelope([eventItem()])), 503);
    assert.equal(upstream.requests.length, before);
  });
} finally {
  await stop(proxy);
}

proxy = startProxy();
try {
  await waitUp();
  await test("fails closed without a limit store binding", () =>
    expectStatus(post(envelope([eventItem()])), 503));
} finally {
  await stop(proxy);
}

proxy = startProxy(["--d1", "DIAGNOSTICS_DB=diag-local"], "false");
try {
  await waitUp();
  await test("switch turns the proxy off", async () => {
    const before = upstream.requests.length;
    await expectStatus(post(envelope([eventItem()])), 404);
    assert.equal(upstream.requests.length, before);
  });
} finally {
  await stop(proxy);
}

mock.close();
rmSync(work, { recursive: true, force: true });
const failed = results.filter(([s]) => s === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
