# The Email Specification

[The Email Specification](https://specification.email) is a platform-agnostic, sourced checklist of what reliable email does: message format, authentication, deliverability, accessible content, client-safe rendering, privacy, internationalisation, lifecycle handling, security, and machine-readable automation.

It follows the product architecture of [The Website Specification](https://specification.website), adapted to the entire email delivery and rendering chain.

## One source, many outputs

Topic Markdown under `src/content/spec/` generates:

- browsable HTML topic and category pages;
- an interactive checklist and Markdown download;
- per-topic Markdown alternates;
- category sitemaps, schema graph, schema map, RSS, and `llms.txt`;
- `llms-full.txt` and an OKF bundle;
- the Pagefind search index;
- a bundled manifest for the MCP and A2A Worker.

## Development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev             # site: http://localhost:31337
npm run mcp:dev         # MCP Worker: http://localhost:31338
npm run build
npm run check
npm run mcp:typecheck
npm run mcp:dry-run
```

## Diagnostics

Browser errors and 10% of page loads are reported to GlitchTip with `@sentry/browser` (`src/components/Diagnostics.astro`). The SDK sends envelopes to the same-origin tunnel `/api/diagnostics`, a Pages Function (`functions/api/diagnostics.ts`) that forwards one error or transaction per request to a fixed GlitchTip project. It enforces the site Origin, a 64 KB limit, 20 requests per minute per IP and 2,000 per day, using HMAC-hashed IPs in D1 that expire within minutes, and it scrubs user data, cookies, headers, bodies, and query strings.

Configuration lives in the Cloudflare Pages project, not in this repository:

| Name                               | Kind           | Purpose                                               |
| ---------------------------------- | -------------- | ----------------------------------------------------- |
| `PUBLIC_SENTRY_DSN`                | build variable | Enables the browser SDK; unset means no telemetry     |
| `PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | build variable | Performance sampling, default `0.1`                   |
| `DIAGNOSTICS_ENABLED`              | variable       | `true` turns the tunnel on; anything else returns 404 |
| `GLITCHTIP_DSN`                    | secret         | The only upstream project the tunnel sends to         |
| `DIAGNOSTICS_HASH_SALT`            | secret         | HMAC key for rate-limit IP hashes                     |
| `DIAGNOSTICS_DB`                   | D1 binding     | Rate-limit counters; if unavailable, nothing is sent  |

Run `npm run functions:typecheck` and `npm run diagnostics:test` (end-to-end against a mock upstream; takes about three minutes) after changing the tunnel.

## MCP tools

The stateless, read-only Worker exposes `search`, `list_topics`, `get_topic`, `get_checklist`, `get_categories`, and `get_changes`, plus an `audit_email` prompt. Its production endpoint is configured as `https://mcp.specification.email/mcp`.

## Adding a topic

1. Pick a category under `src/content/spec/`.
2. Copy an existing Markdown file.
3. Set title, summary, status, order, related slugs, and at least one authoritative source.
4. Use the standard sections: What it is, Why it matters, How to implement, Common mistakes, Verification.
5. Add a changelog entry for material additions or status changes.

## Licence

Code is available under the MIT licence. Specification content is available under CC BY 4.0.
