---
title: Internet message format
category: foundations
summary: Every message must use the standard header and body structure, valid line endings, and legal field syntax before it enters SMTP.
status: required
order: 1
relatedSlugs: [header-fields, mime-multipart]
sources:
  - title: RFC 5322 — Internet Message Format
    url: https://www.rfc-editor.org/rfc/rfc5322
    publisher: IETF
---

## What it is

An email is a sequence of header fields, a blank line, and an optional body. RFC 5322 defines the grammar, line length limits, folding rules, and address syntax used after SMTP transport.

## Why it matters

Malformed source may be rewritten, rejected, or interpreted differently by relays, filters, and clients. Authentication signatures also depend on predictable bytes.

## How to implement

Generate messages with a maintained mail library. Use CRLF line endings on the wire, keep each field syntactically valid, and never construct address fields by joining untrusted strings.

## Common mistakes

- Omitting the blank line between headers and body.
- Using a display name as though it were an address.
- Folding a field at an arbitrary byte boundary.

## Verification

Inspect the raw delivered source and parse it with an independent standards-aware parser. The parser should report no invalid fields or truncated body.
