import type { Considered, Manifest, Status, Topic } from "./types";

const statuses = new Set<Status>(["required", "recommended", "optional", "avoid"]);
const text = (value: unknown) => (typeof value === "string" ? value : undefined);
const number = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;
const status = (value: unknown) =>
  typeof value === "string" && statuses.has(value as Status)
    ? (value as Status)
    : undefined;
const result = (plain: string, structuredContent: unknown, isError = false) => ({
  content: [{ type: "text", text: plain }],
  structuredContent,
  ...(isError ? { isError: true } : {}),
});

function filtered(manifest: Manifest, args: Record<string, unknown>): Topic[] {
  const category = text(args.category);
  const wantedStatus = status(args.status);
  return manifest.topics.filter(
    (topic) =>
      (!category || topic.category === category) &&
      (!wantedStatus || topic.status === wantedStatus),
  );
}

function rank(topic: Topic, query: string): number {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 1);
  const title = topic.title.toLowerCase();
  const slug = topic.slug.toLowerCase();
  const summary = topic.summary.toLowerCase();
  const body = topic.body.toLowerCase();
  return terms.reduce(
    (score, term) =>
      score +
      (title.includes(term) ? 8 : 0) +
      (slug.includes(term) ? 6 : 0) +
      (summary.includes(term) ? 4 : 0) +
      Math.min(body.split(term).length - 1, 5),
    title.includes(query.toLowerCase()) ? 12 : 0,
  );
}

function rankConsidered(entry: Considered, query: string): number {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 1);
  const title = entry.title.toLowerCase();
  const revisit = (entry.revisit ?? "").toLowerCase();
  const body = entry.body.toLowerCase();
  return terms.reduce(
    (score, term) =>
      score +
      (title.includes(term) ? 8 : 0) +
      (revisit.includes(term) ? 3 : 0) +
      Math.min(body.split(term).length - 1, 5),
    title.includes(query.toLowerCase()) ? 12 : 0,
  );
}

export const tools = [
  {
    name: "search",
    title: "Search email standards",
    description:
      "Ranked full-text search across every Email Specification topic, including technologies deliberately considered and left out of the specification.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 25 },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "list_topics",
    title: "List email topics",
    description: "List topics, optionally filtered by category or status.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string" },
        status: { enum: [...statuses] },
        limit: { type: "integer", minimum: 1, maximum: 200 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "get_topic",
    title: "Get one email topic",
    description: "Fetch the canonical Markdown for one topic slug.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "get_checklist",
    title: "Build an email checklist",
    description: "Generate an audit checklist, optionally filtered by category or status.",
    inputSchema: {
      type: "object",
      properties: { category: { type: "string" }, status: { enum: [...statuses] } },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "get_categories",
    title: "List email categories",
    description: "List categories and topic counts.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
  {
    name: "get_changes",
    title: "Get specification changes",
    description: "Read changes since an ISO date.",
    inputSchema: {
      type: "object",
      properties: {
        since: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 100 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  },
] as const;

export function callTool(manifest: Manifest, name: unknown, args: Record<string, unknown>) {
  switch (name) {
    case "search": {
      const query = text(args.query)?.trim();
      if (!query)
        return result(
          "Tool error: query is required.",
          { error: "query is required" },
          true,
        );
      const limit = Math.min(Math.max(number(args.limit) ?? 5, 1), 25);
      const matches = manifest.topics
        .map((topic) => ({ topic, score: rank(topic, query) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.topic.order - b.topic.order)
        .slice(0, limit);
      const excluded = manifest.considered
        .map((entry) => ({ entry, score: rankConsidered(entry, query) }))
        .filter((item) => item.score >= 3)
        .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
        .slice(0, limit);
      const topicBlock = matches
        .map(
          ({ topic, score }) =>
            `### ${topic.title}\n- ${topic.status} · ${topic.category} · score ${score}\n- ${topic.url}\n\n${topic.summary}`,
        )
        .join("\n\n");
      const excludedBlock = excluded.length
        ? [
            "## Considered and not included",
            "",
            "These are not specification requirements. The specification evaluated them and deliberately left them out.",
            "",
            excluded
              .map(
                ({ entry, score }) =>
                  `### ${entry.title}\n- considered · ${entry.reason} · not a requirement · score ${score}\n- ${entry.url}\n\n${entry.body}${entry.revisit ? `\n\nRevisit when: ${entry.revisit}` : ""}`,
              )
              .join("\n\n"),
          ].join("\n")
        : "";
      const plain =
        matches.length || excluded.length
          ? [topicBlock, excludedBlock].filter(Boolean).join("\n\n")
          : `No topics matched “${query}”.`;
      return result(plain, {
        query,
        count: matches.length,
        results: matches.map(({ topic, score }) => ({
          slug: topic.slug,
          title: topic.title,
          status: topic.status,
          category: topic.category,
          url: topic.url,
          mdUrl: topic.mdUrl,
          summary: topic.summary,
          score,
        })),
        consideredCount: excluded.length,
        considered: excluded.map(({ entry, score }) => ({
          title: entry.title,
          reason: entry.reason,
          revisit: entry.revisit,
          url: entry.url,
          sources: entry.sources,
          score,
        })),
      });
    }
    case "list_topics": {
      const items = filtered(manifest, args).slice(
        0,
        Math.min(Math.max(number(args.limit) ?? 200, 1), 200),
      );
      return result(
        items
          .map(
            (topic) =>
              `- **[${topic.title}](${topic.url})** — ${topic.status}, ${topic.category}\n  ${topic.summary}`,
          )
          .join("\n"),
        {
          count: items.length,
          topics: items.map(({ body: _body, sources: _sources, ...topic }) => topic),
        },
      );
    }
    case "get_topic": {
      const slug = text(args.slug);
      const topic = manifest.topics.find(
        (item) => item.slug.toLowerCase() === slug?.toLowerCase(),
      );
      if (!topic)
        return result(
          `No topic found for slug “${slug ?? ""}”.`,
          { error: "not found", slug },
          true,
        );
      const markdown = `---\ntitle: ${JSON.stringify(topic.title)}\ncategory: ${topic.category}\nstatus: ${topic.status}\ncanonical: ${topic.url}\n---\n\n# ${topic.title}\n\n> ${topic.summary}\n\n${topic.body}`;
      return result(markdown, { ...topic, markdown });
    }
    case "get_checklist": {
      const items = filtered(manifest, args);
      const groups = manifest.categories
        .map((category) => ({
          category,
          topics: items.filter((topic) => topic.category === category.slug),
        }))
        .filter((group) => group.topics.length);
      const markdown = [
        "# The Email Specification — checklist",
        "",
        ...groups.flatMap(({ category, topics }) => [
          `## ${category.title}`,
          "",
          ...topics.map(
            (topic) =>
              `- [ ] **${topic.title}** _(${topic.status})_ — ${topic.summary}\n  ${topic.url}`,
          ),
          "",
        ]),
      ].join("\n");
      return result(markdown, { count: items.length, categories: groups });
    }
    case "get_categories": {
      const categories = manifest.categories.map((category) => ({
        ...category,
        topicCount: manifest.topics.filter((topic) => topic.category === category.slug)
          .length,
      }));
      return result(
        categories
          .map(
            (category) =>
              `- **${category.title}** — ${category.topicCount} topics. ${category.summary}`,
          )
          .join("\n"),
        { count: categories.length, categories },
      );
    }
    case "get_changes": {
      const since = text(args.since)?.slice(0, 10);
      const limit = Math.min(Math.max(number(args.limit) ?? 20, 1), 100);
      const changes = manifest.changelog
        .filter((change) => !since || change.date >= since)
        .slice(0, limit);
      return result(
        changes
          .map(
            (change) =>
              `### ${change.date} — ${change.title} _(${change.type})_\n${change.body}`,
          )
          .join("\n\n"),
        { count: changes.length, changes },
      );
    }
    default:
      return result(`Unknown tool: ${String(name)}`, { error: "unknown tool", name }, true);
  }
}
