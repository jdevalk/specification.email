// @ts-check
import { defineConfig } from "astro/config";
import seoGraph from "@jdevalk/astro-seo-graph/integration";

const SITE = "https://specification.email";

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
  integrations: [
    seoGraph({
      validateH1: true,
      validateUniqueMetadata: true,
      validateImageAlt: true,
      validateMetadataLength: true,
      validateInternalLinks: true,
      llmsTxt: {
        title: "The Email Specification",
        siteUrl: SITE,
        summary:
          "A platform-agnostic specification of what reliable, accessible, secure email does.",
        autoSectionName: "Specification pages",
        filter: (url) => !new URL(url).pathname.startsWith("/404"),
      },
    }),
  ],
  server: { port: 31337, host: true },
  markdown: {
    shikiConfig: {
      themes: { light: "github-light-default", dark: "github-dark-default" },
      defaultColor: false,
      wrap: true,
    },
  },
  build: { inlineStylesheets: "auto" },
});
