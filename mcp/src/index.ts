import manifestJson from "./data.json" with { type: "json" };
import { callTool, tools } from "./tools";
import type { Manifest, RpcRequest, RpcResponse } from "./types";

const manifest = manifestJson as Manifest;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version, Mcp-Session-Id",
  "Access-Control-Expose-Headers": "MCP-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};
const jsonHeaders = { "Content-Type": "application/json; charset=utf-8", ...cors };
const ok = (id: RpcRequest["id"], value: unknown): RpcResponse => ({
  jsonrpc: "2.0",
  id: id ?? null,
  result: value,
});
const error = (id: RpcRequest["id"], code: number, message: string): RpcResponse => ({
  jsonrpc: "2.0",
  id: id ?? null,
  error: { code, message },
});

function isRpc(value: unknown): value is RpcRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    "jsonrpc" in value &&
    (value as { jsonrpc?: unknown }).jsonrpc === "2.0" &&
    "method" in value &&
    typeof (value as { method?: unknown }).method === "string"
  );
}

function handleRpc(request: RpcRequest): RpcResponse | null {
  const params = request.params ?? {};
  switch (request.method) {
    case "initialize":
      return ok(request.id, {
        protocolVersion: "2025-11-25",
        capabilities: { tools: { listChanged: false }, prompts: { listChanged: false } },
        serverInfo: {
          name: "specification-email",
          title: "The Email Specification",
          version: "0.1.0",
          websiteUrl: "https://specification.email",
        },
        instructions:
          "Use search for discovery, get_topic for full guidance, and get_checklist for audits. All tools are read-only.",
      });
    case "notifications/initialized":
    case "notifications/cancelled":
      return null;
    case "ping":
      return ok(request.id, {});
    case "tools/list":
      return ok(request.id, { tools });
    case "tools/call":
      return ok(
        request.id,
        callTool(
          manifest,
          params.name,
          typeof params.arguments === "object" && params.arguments !== null
            ? (params.arguments as Record<string, unknown>)
            : {},
        ),
      );
    case "prompts/list":
      return ok(request.id, {
        prompts: [
          {
            name: "audit_email",
            title: "Audit an email",
            description:
              "Build an audit plan for a delivered message and its sending domain.",
            arguments: [
              {
                name: "focus",
                description: "Optional category or status",
                required: false,
              },
            ],
          },
        ],
      });
    case "prompts/get": {
      if (params.name !== "audit_email") return error(request.id, -32602, "Unknown prompt");
      const focus =
        typeof (params.arguments as { focus?: unknown } | undefined)?.focus === "string"
          ? (params.arguments as { focus: string }).focus
          : "required";
      const checklist = callTool(
        manifest,
        "get_checklist",
        focus === "required" ? { status: "required" } : { category: focus },
      );
      return ok(request.id, {
        description: `Audit plan focused on ${focus}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Inspect the delivered raw email, its DNS-authentication records, and its rendered output against this checklist. Report pass, fail, not applicable, and evidence for every item.\n\n${checklist.content[0].text}`,
            },
          },
        ],
      });
    }
    default:
      return error(request.id, -32601, `Method not found: ${request.method}`);
  }
}

function a2a(request: RpcRequest): RpcResponse {
  if (request.method !== "message/send")
    return error(request.id, -32601, `Method not found: ${request.method}`);
  const message = (request.params?.message ?? request.params) as
    { contextId?: string; parts?: { kind?: string; text?: string }[] } | undefined;
  const query = message?.parts
    ?.filter((part) => part.kind === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join(" ")
    .trim();
  const search = callTool(manifest, "search", { query: query || "email", limit: 5 });
  return ok(request.id, {
    kind: "message",
    messageId: crypto.randomUUID(),
    contextId: message?.contextId,
    role: "agent",
    parts: [{ kind: "text", text: search.content[0].text }],
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: cors });
    if (request.method === "GET" && url.pathname === "/")
      return new Response(
        "The Email Specification MCP server\n\nPOST JSON-RPC to /mcp or /a2a/v1.\n",
        { headers: { "Content-Type": "text/plain; charset=utf-8", ...cors } },
      );
    if (request.method === "GET" && url.pathname === "/.well-known/mcp/server-card.json")
      return Response.json(
        {
          name: "specification-email",
          version: "0.1.0",
          transport: { type: "streamable-http", url: `${url.origin}/mcp` },
          capabilities: { tools: true, prompts: true },
        },
        { headers: cors },
      );
    if (
      request.method !== "POST" ||
      (url.pathname !== "/mcp" && url.pathname !== "/a2a/v1")
    )
      return new Response("Not found", { status: 404, headers: cors });
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify(error(null, -32700, "Parse error")), {
        status: 400,
        headers: jsonHeaders,
      });
    }
    const requests = Array.isArray(payload) ? payload : [payload];
    if (!requests.every(isRpc))
      return new Response(JSON.stringify(error(null, -32600, "Invalid Request")), {
        status: 400,
        headers: jsonHeaders,
      });
    const responses = requests
      .map((item) => (url.pathname === "/a2a/v1" ? a2a(item) : handleRpc(item)))
      .filter((item): item is RpcResponse => item !== null);
    if (!responses.length) return new Response(null, { status: 202, headers: cors });
    return new Response(JSON.stringify(Array.isArray(payload) ? responses : responses[0]), {
      headers: { ...jsonHeaders, "MCP-Protocol-Version": "2025-11-25" },
    });
  },
} satisfies ExportedHandler;
