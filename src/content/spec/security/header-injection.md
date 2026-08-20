---
title: Email header injection prevention
category: security
summary: Treat every header value as structured data, reject line breaks from untrusted input, and let a mail library serialize addresses and fields.
status: required
order: 1
relatedSlugs: [message-format, safe-links]
sources:
  - title: CWE-93 — Improper Neutralization of CRLF Sequences
    url: https://cwe.mitre.org/data/definitions/93.html
    publisher: MITRE
---

## What it is

Header injection occurs when attacker-controlled carriage returns or line feeds create additional message fields or alter MIME structure.

## Why it matters

An unsafe subject, display name, reply address, or filename can add recipients, change content type, or turn a form into a spam relay.

## How to implement

Use typed mail APIs, validate mailbox syntax, reject control characters in all header inputs, and keep user content in body parts rather than raw source templates.

## Common mistakes

- Stripping only `\n` while accepting `\r`.
- Concatenating attachment filenames into raw fields.
- Assuming an upstream form validator protects internal API calls.

## Verification

Fuzz every header-facing input with CR, LF, encoded newlines, long values, quotes, and Unicode separators. No case may create a new field.
