---
title: Robust email layout tables
category: rendering
summary: Use a simple presentation-table scaffold where client support requires it, without leaking table semantics into the reading experience.
status: recommended
order: 1
relatedSlugs: [inline-css, responsive-layout]
sources:
  - title: Tables in HTML email
    url: https://www.caniemail.com/features/html-table/
    publisher: Can I Email
---

## What it is

Many email clients still render complex layouts most consistently when structure is expressed with nested HTML tables.

## Why it matters

Modern layout CSS is not uniformly supported, especially in desktop clients using document-rendering engines.

## How to implement

Keep nesting shallow, set presentation roles, include explicit cell padding and widths where necessary, and preserve a logical source order. Use modern CSS progressively when its loss does not break meaning.

## Common mistakes

- Omitting `role="presentation"` from layout tables.
- Creating a visual order that differs from DOM order.
- Depending on background images for essential content.

## Verification

Test the delivered message in representative webmail, mobile, and desktop clients with images on and off, then inspect the accessibility tree.
