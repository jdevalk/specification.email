---
title: Retry strategy and message expiry
category: lifecycle
summary: Retry transient SMTP failures with backoff, cap queue lifetime, and expire time-sensitive messages before delayed delivery becomes harmful.
status: required
order: 3
relatedSlugs: [bounce-handling, message-id]
sources:
  - title: RFC 5321 — Queuing strategies
    url: https://www.rfc-editor.org/rfc/rfc5321#section-4.5.4.1
    publisher: IETF
---

## What it is

SMTP clients queue messages after transient failures and attempt redelivery. Application semantics may impose a shorter useful lifetime than SMTP's general queue policy.

## Why it matters

Immediate repeated retries amplify outages. Delivering an old login code, price alert, or cancellation notice can confuse or endanger recipients.

## How to implement

Use increasing retry intervals with jitter, honor server guidance, cap total attempts, and attach an application expiry to time-sensitive mail. Keep idempotency across retries.

## Common mistakes

- Retrying permanent 5xx responses.
- Generating a new logical message for every transport attempt.
- Applying one queue lifetime to receipts and verification codes.

## Verification

Simulate sustained 4xx responses and recovery. Observe spaced attempts, stable message identity, correct final failure, and expiry before stale delivery.
