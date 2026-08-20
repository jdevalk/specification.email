---
title: Reverse DNS and sending identity
category: deliverability
summary: Every sending IP needs stable forward-confirmed reverse DNS, an SMTP greeting that matches it, and an operational domain identity.
status: required
order: 1
relatedSlugs: [list-hygiene, complaint-handling]
sources:
  - title: RFC 5321 — SMTP client identity
    url: https://www.rfc-editor.org/rfc/rfc5321#section-4.1.4
    publisher: IETF
---

## What it is

Reverse DNS maps a sending IP to a hostname. Forward-confirmed reverse DNS means that hostname resolves back to the IP.

## Why it matters

Mailbox providers expect accountable infrastructure. Missing or generic identity is a common rejection and reputation signal.

## How to implement

Assign a dedicated, meaningful hostname to each sending IP, configure PTR through the IP owner, publish matching A or AAAA records, and use that hostname in SMTP EHLO.

## Common mistakes

- Setting a PTR that does not resolve forward.
- Sharing one hostname between unrelated operators.
- Greeting with `localhost` or a bare IP literal.

## Verification

Resolve IP → PTR → address and compare the SMTP banner and EHLO name. Repeat from a resolver outside your own network.
