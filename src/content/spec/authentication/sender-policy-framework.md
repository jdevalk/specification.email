---
title: Sender Policy Framework (SPF)
category: authentication
summary: Publish one bounded SPF policy that authorizes legitimate envelope senders without exceeding DNS lookup limits or permitting the world.
status: required
order: 1
relatedSlugs: [dkim-signatures, dmarc-policy]
sources:
  - title: RFC 7208 — Sender Policy Framework
    url: https://www.rfc-editor.org/rfc/rfc7208
    publisher: IETF
---

## What it is

SPF lets a domain publish which hosts may send SMTP mail using that domain in the envelope sender or HELO identity.

## Why it matters

Receivers use SPF as one authentication signal and as one path to DMARC alignment. A broken record can make legitimate mail fail before content is considered.

## How to implement

Publish exactly one TXT policy per domain. Authorize only current senders, stay within the ten DNS-lookup limit, and finish with a deliberate `-all` or `~all` while rolling out.

## Common mistakes

- Publishing multiple SPF records.
- Adding broad providers that do not send for the domain.
- Assuming SPF authenticates the visible `From` address by itself.

## Verification

Resolve the record from public DNS, count all recursive lookups, and inspect `Authentication-Results` on messages from every sending source.
