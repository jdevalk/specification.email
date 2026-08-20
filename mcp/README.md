# specification.email MCP server

A public, stateless, read-only Cloudflare Worker over the same Markdown corpus as [The Email Specification](https://specification.email).

## Tools

`search`, `list_topics`, `get_topic`, `get_checklist`, `get_categories`, and `get_changes`.

## Local development

```sh
npm install
npm run mcp:dev
```

The Worker listens on <http://localhost:31338>. POST JSON-RPC 2.0 requests to `/mcp`. The A2A JSON-RPC endpoint is `/a2a/v1`.

## Deployment

The custom domain `mcp.specification.email` is configured in `wrangler.jsonc`. The Cloudflare account ID is deliberately not tracked in this public repository; put it in a gitignored `mcp/.env` before the first deploy:

```sh
echo "CLOUDFLARE_ACCOUNT_ID=<account-id>" > mcp/.env
```

Then authenticate Wrangler and run `npm run deploy --workspace mcp`. The `predeploy` step regenerates the bundled manifest.
