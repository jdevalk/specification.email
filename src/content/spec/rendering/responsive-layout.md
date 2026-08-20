---
title: Responsive email layout
category: rendering
summary: Messages must fit narrow screens, preserve readable type, and keep controls usable even when media queries or viewport hints are ignored.
status: required
order: 3
relatedSlugs: [table-layout, color-and-contrast]
sources:
  - title: WCAG 2.2 — Reflow
    url: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
    publisher: W3C
---

## What it is

Responsive email adapts to small viewports using fluid widths, constrained containers, stackable regions, and media queries as enhancement.

## Why it matters

Recipients should not need horizontal scrolling or zoom to read copy and activate the primary action.

## How to implement

Use a fluid outer table capped at a sensible desktop width, images with `max-width:100%`, and single-column fallback order. Keep body text comfortably readable and touch targets separated.

## Common mistakes

- Setting fixed widths wider than common phone screens.
- Shrinking desktop columns until text becomes unusable.
- Hiding essential content in mobile CSS.

## Verification

Render from 320 CSS pixels upward with media queries disabled and enabled. No essential region should overflow or overlap.
