---
title: Inline CSS and safe fallbacks
category: rendering
summary: Inline critical presentation, keep selectors simple, and design fallbacks for clients that remove style blocks or ignore unsupported properties.
status: recommended
order: 2
relatedSlugs: [table-layout, responsive-layout]
sources:
  - title: CSS support in email clients
    url: https://www.caniemail.com/features/
    publisher: Can I Email
---

## What it is

Inlining copies essential CSS declarations onto each element because some clients strip, scope, or incompletely support embedded styles.

## Why it matters

A message that depends on one style block can degrade into unreadable content when the block is removed.

## How to implement

Inline typography, spacing, colors, and table rules that are essential to comprehension. Use a build tool to inline consistently, then retain media queries and supported progressive rules in a style block.

## Common mistakes

- Inlining before template rendering, leaving dynamic elements unstyled.
- Relying on shorthand properties with uneven support.
- Letting an inliner overwrite dark-mode or responsive declarations.

## Verification

Inspect delivered HTML to confirm critical declarations are present. Remove all style blocks and confirm the message remains legible and actionable.
