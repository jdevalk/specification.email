---
title: Internationalized email addresses
category: internationalisation
summary: Accept and preserve Unicode mailbox addresses only when every validation, storage, SMTP, and support path handles SMTPUTF8 safely.
status: recommended
order: 3
relatedSlugs: [utf-8-content, message-format]
sources:
  - title: RFC 6531 — SMTP Extension for Internationalized Email
    url: https://www.rfc-editor.org/rfc/rfc6531
    publisher: IETF
---

## What it is

SMTPUTF8 permits UTF-8 in mailbox local parts and extends SMTP negotiation for internationalized addresses and headers.

## Why it matters

ASCII-only validation excludes legitimate addresses, but partial support can accept an address that a later system cannot send to or display.

## How to implement

Preserve Unicode, validate syntax without inventing narrower rules, store sufficient length, negotiate SMTPUTF8, and use IDNA consistently for international domain names.

## Common mistakes

- Lowercasing or normalizing the local part destructively.
- Applying website-domain validation to a full mailbox.
- Advertising support while a bounce processor is ASCII-only.

## Verification

Run international-address fixtures through sign-up, database, API, queue, MTA, webhook, suppression, export, and support tooling.
