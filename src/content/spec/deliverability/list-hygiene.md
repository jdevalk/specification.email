---
title: Recipient list hygiene
category: deliverability
summary: Send only to expected recipients, remove permanent failures, suppress complainers, and stop mailing addresses that never engage or consent.
status: required
order: 2
relatedSlugs: [bounce-handling, complaint-handling]
sources:
  - title: Gmail email sender guidelines
    url: https://support.google.com/a/answer/81126
    publisher: Google
---

## What it is

List hygiene keeps the recipient set current, permissioned, and reachable. It combines acquisition controls, suppression, bounce processing, and inactivity policy.

## Why it matters

Repeated sends to invalid or unwilling recipients create complaints and negative reputation signals that affect wanted mail too.

## How to implement

Record the source and time of consent, confirm risky sign-ups, suppress hard bounces and complaints immediately, and define when inactive recipients stop receiving campaigns.

## Common mistakes

- Buying or scraping addresses.
- Re-importing suppressed recipients from another system.
- Retrying permanent failures as though they were temporary.

## Verification

Trace sample recipients from acquisition through suppression. Confirm every send path applies the same central suppression data before queueing.
