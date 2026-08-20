---
title: Alternative text for email images
category: accessibility
summary: Every informative image needs concise equivalent alt text, while decorative images need an empty alt attribute and no repeated meaning.
status: required
order: 2
relatedSlugs: [semantic-structure, plain-text-alternative]
sources:
  - title: WCAG 2.2 — Non-text Content
    url: https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html
    publisher: W3C
---

## What it is

The `alt` attribute supplies a text alternative when an image cannot be seen, loaded, or understood visually.

## Why it matters

Images are often blocked by default and screen-reader users may never perceive them. Meaning cannot depend on image loading.

## How to implement

Describe the purpose of informative images in context. Use `alt=""` for decoration. Put essential calls to action in live text and repeat complex chart data in nearby text.

## Common mistakes

- Repeating “image of” before a description.
- Using a filename or tracking identifier as alt text.
- Leaving out the attribute on spacer and decorative images.

## Verification

Disable images, then read the message visually and with a screen reader. All actions and essential information must remain understandable.
