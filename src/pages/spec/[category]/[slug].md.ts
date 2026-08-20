import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { site } from "~/lib/site";

export async function getStaticPaths() {
  const topics = await getCollection("spec", ({ data }) => !data.draft);
  return topics.map((topic) => {
    const slug = topic.data.slug ?? topic.id.split("/").pop()!;
    return { params: { category: topic.data.category, slug }, props: { topic, slug } };
  });
}

export const GET: APIRoute = ({ props }) => {
  const { topic, slug } = props;
  const canonical = `${site.url}/spec/${topic.data.category}/${slug}/`;
  const sourceLines = topic.data.sources.flatMap(
    (source: { title: string; url: string; publisher?: string }) => [
      `  - title: ${JSON.stringify(source.title)}`,
      `    url: ${JSON.stringify(source.url)}`,
      ...(source.publisher ? [`    publisher: ${JSON.stringify(source.publisher)}`] : []),
    ],
  );
  const markdown = [
    "---",
    `title: ${JSON.stringify(topic.data.title)}`,
    `description: ${JSON.stringify(topic.data.summary)}`,
    `canonical: ${canonical}`,
    `category: ${topic.data.category}`,
    `status: ${topic.data.status}`,
    "sources:",
    ...sourceLines,
    "---",
    "",
    `# ${topic.data.title}`,
    "",
    `> ${topic.data.summary}`,
    "",
    topic.body,
  ].join("\n");
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "noindex, follow",
      Link: `<${canonical}>; rel="canonical"`,
    },
  });
};
