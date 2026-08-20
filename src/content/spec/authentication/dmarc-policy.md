---
title: DMARC alignment and policy
category: authentication
summary: Publish DMARC, collect reports, align SPF or DKIM with the visible From domain, and move to enforcement only after legitimate flows pass.
status: required
order: 3
relatedSlugs: [sender-policy-framework, dkim-signatures]
sources:
  - title: RFC 7489 — Domain-based Message Authentication, Reporting, and Conformance
    url: https://www.rfc-editor.org/rfc/rfc7489
    publisher: IETF
---

## What it is

DMARC binds the domain people see in `From` to an authenticated SPF or DKIM domain, then publishes handling and reporting preferences.

## Why it matters

Alignment makes authentication meaningful to recipients and gives domain owners visibility into legitimate and abusive use.

## How to implement

Start with `p=none` and aggregate reports, inventory every sender, fix alignment, then progress to quarantine or reject. Define subdomain policy and reporting destinations deliberately.

## Common mistakes

- Treating `p=none` as finished protection.
- Enforcing before forgotten senders are aligned.
- Reading pass rates without separating legitimate sources from abuse.

## Verification

Inspect `Authentication-Results` for `dmarc=pass` and confirm the passing identifier aligns with `From`. Review aggregate reports across at least one normal sending cycle.
