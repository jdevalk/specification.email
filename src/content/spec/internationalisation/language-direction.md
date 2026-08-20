---
title: Message language and text direction
category: internationalisation
summary: Declare the message language and mark bidirectional runs so pronunciation, punctuation, numerals, and reading order remain correct.
status: required
order: 2
relatedSlugs: [utf-8-content, reading-order]
sources:
  - title: WCAG 2.2 — Language of Page
    url: https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html
    publisher: W3C
  - title: W3C — Structural markup and right-to-left text
    url: https://www.w3.org/International/questions/qa-html-dir
    publisher: W3C
---

## What it is

The `lang` attribute identifies language; `dir` and bidirectional markup establish reading direction for right-to-left and mixed-direction text.

## Why it matters

Assistive technology chooses pronunciation from language. Bidirectional text can display punctuation, phone numbers, and embedded addresses in the wrong order without markup.

## How to implement

Set `lang` and `dir` on the HTML root, override them for passages in another language, and use `dir="auto"` carefully for user-generated fragments.

## Common mistakes

- Using text alignment instead of direction.
- Mirroring logos or media controls.
- Concatenating an LTR identifier into RTL text without isolation.

## Verification

Read with a screen reader configured for each language and test mixed names, dates, prices, URLs, and phone numbers in RTL clients.
