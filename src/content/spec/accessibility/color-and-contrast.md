---
title: Email color contrast and cues
category: accessibility
summary: Text, controls, and meaningful graphics need sufficient contrast, and color must never be the only way the message communicates state.
status: required
order: 3
relatedSlugs: [dark-mode, link-text]
sources:
  - title: WCAG 2.2 — Contrast (Minimum)
    url: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
    publisher: W3C
  - title: WCAG 2.2 — Use of Color
    url: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
    publisher: W3C
---

## What it is

Normal text needs at least 4.5:1 contrast and large text at least 3:1 under WCAG AA. Information conveyed by color also needs a text, icon, pattern, or positional cue.

## Why it matters

Low-contrast copy becomes unreadable for many recipients and can fail completely when a client changes colors for dark mode.

## How to implement

Measure actual foreground and background pairs, including buttons and fallback colors. Underline links in body copy and label states such as errors or success in words.

## Common mistakes

- Testing brand swatches but not rendered combinations.
- Assuming bold text qualifies as large text.
- Distinguishing links from copy only by color.

## Verification

Measure every text style and inspect forced dark mode in major clients. Check the message in grayscale to expose color-only distinctions.
