---
title: Semantic email structure
category: accessibility
summary: Use headings, paragraphs, lists, tables, and landmarks according to meaning so assistive technology can navigate the message.
status: required
order: 1
relatedSlugs: [reading-order, link-text]
sources:
  - title: WCAG 2.2 — Info and Relationships
    url: https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html
    publisher: W3C
---

## What it is

Semantic structure expresses relationships in markup rather than only through size, weight, spacing, or color.

## Why it matters

Screen readers use headings and lists to provide an outline. When everything is a styled table cell or paragraph, that navigation disappears.

## How to implement

Use one descriptive `h1`, then headings in a logical order. Mark actual lists as lists. Give layout tables `role="presentation"`; keep data table semantics when the table conveys relationships.

## Common mistakes

- Choosing heading levels for appearance.
- Applying presentation roles to genuine data tables.
- Hiding meaningful text in images.

## Verification

Read the accessibility tree in a supporting client and navigate by headings. The outline must describe the message without relying on visual layout.
