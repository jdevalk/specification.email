import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const sourceSchema = z.object({
  title: z.string(),
  url: z.url(),
  publisher: z.string().optional(),
});

const spec = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/spec" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    category: z.enum([
      "foundations",
      "authentication",
      "deliverability",
      "accessibility",
      "rendering",
      "privacy",
      "internationalisation",
      "lifecycle",
      "security",
      "automation",
    ]),
    summary: z.string(),
    status: z.enum(["required", "recommended", "optional", "avoid"]),
    appliesTo: z.array(z.string()).default(["all"]),
    relatedSlugs: z.array(z.string()).default([]),
    sources: z.array(sourceSchema).min(1),
    order: z.number().default(100),
    draft: z.boolean().default(false),
    updated: z.string().optional(),
  }),
});

const changelog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/changelog" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    type: z.enum(["added", "changed", "status", "removed"]).default("changed"),
    relatedSlugs: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const considered = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/considered" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    reason: z.enum(["too-early", "out-of-scope", "too-narrow"]),
    revisit: z.string().optional(),
    sources: z.array(sourceSchema).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { spec, changelog, considered };
