---
title: Delivery status and bounce handling
category: lifecycle
summary: Classify SMTP and delivery-status failures, stop permanent retries, back off temporary failures, and connect outcomes to the correct recipient.
status: required
order: 2
relatedSlugs: [list-hygiene, retry-expiry]
sources:
  - title: RFC 3463 — Enhanced Mail System Status Codes
    url: https://www.rfc-editor.org/rfc/rfc3463
    publisher: IETF
  - title: RFC 3464 — Delivery Status Notifications
    url: https://www.rfc-editor.org/rfc/rfc3464
    publisher: IETF
---

## What it is

Bounces and delivery-status notifications describe failed or delayed recipients with SMTP replies and structured enhanced status codes.

## Why it matters

Permanent failures need suppression; temporary failures need bounded retry. Treating both alike either wastes capacity or drops recoverable mail.

## How to implement

Parse machine-readable status data, preserve the original recipient correlation, distinguish 4.x.x from 5.x.x outcomes, and apply policy by failure class rather than free-text wording.

## Common mistakes

- Matching only English diagnostic phrases.
- Suppressing an address after one ambiguous timeout.
- Sending bounces to an unverified visible From address.

## Verification

Replay fixtures for user unknown, mailbox full, policy block, DNS failure, timeout, and delayed delivery. Each must follow the intended retry or suppression path.
