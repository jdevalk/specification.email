export const site = {
  name: "The Email Specification",
  shortName: "Email Spec",
  url: "https://specification.email",
  description:
    "Email standards for reliable delivery, authentication, accessible content, privacy, and rendering across clients.",
  tagline: "What a good email does, regardless of the platform that sends it.",
  repo: "https://github.com/jdevalk/specification.email",
  author: { name: "Joost de Valk", url: "https://joost.blog" },
  themeColor: "#6d28d9",
  mcp: {
    endpoint: "https://mcp.specification.email/mcp",
    landing: "https://mcp.specification.email/",
  },
} as const;

import categoriesData from "~/data/categories.json";

export const categories = categoriesData;

export type CategorySlug = string;
export const categoryFor = (slug: string) =>
  categories.find((category) => category.slug === slug);

export const statusLabel: Record<string, string> = {
  required: "Required",
  recommended: "Recommended",
  optional: "Optional",
  avoid: "Avoid",
};
