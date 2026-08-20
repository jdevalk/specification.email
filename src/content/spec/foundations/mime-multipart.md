---
title: MIME multipart structure
category: foundations
summary: Use valid MIME types, boundaries, transfer encodings, and multipart nesting so every client can select a safe representation.
status: required
order: 3
relatedSlugs: [plain-text-alternative, attachments]
sources:
  - title: RFC 2045 — Multipurpose Internet Mail Extensions
    url: https://www.rfc-editor.org/rfc/rfc2045
    publisher: IETF
  - title: RFC 2046 — Media types and multipart bodies
    url: https://www.rfc-editor.org/rfc/rfc2046
    publisher: IETF
---

## What it is

MIME adds typed body parts, character sets, transfer encodings, attachments, and multipart containers to Internet messages.

## Why it matters

Clients need MIME structure to choose HTML or plain text, display inline images, and handle attachments without corrupting binary data.

## How to implement

Use `multipart/alternative` for equivalent plain-text and HTML bodies, ordered from least to most faithful. Wrap alternatives and attachments in `multipart/mixed`. Generate unique boundaries and declare a character set for text parts.

## Common mistakes

- Using `multipart/mixed` for equivalent alternatives.
- Declaring UTF-8 while sending another encoding.
- Referring to a Content-ID that has no matching inline part.

## Verification

Parse the delivered source and draw the MIME tree. Open it in a text-only client and a graphical client; each must select the intended representation.
