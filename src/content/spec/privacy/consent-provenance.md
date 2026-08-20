---
title: Consent and subscription provenance
category: privacy
summary: Keep verifiable evidence of how and when each recipient subscribed, what they expected, and which message purposes that choice covered.
status: required
order: 3
relatedSlugs: [list-hygiene, one-click-unsubscribe]
sources:
  - title: GDPR Article 7 — Conditions for consent
    url: https://eur-lex.europa.eu/eli/reg/2016/679/art_7/oj
    publisher: European Union
---

## What it is

Subscription provenance is the audit trail behind permission: source, timestamp, notice shown, purpose, confirmation, and later changes.

## Why it matters

An address in a database is not evidence that its owner asked for every kind of mail. Expectations determine complaints and legal risk.

## How to implement

Store the acquisition source and policy version, separate purposes, make refusal as easy as acceptance, and propagate withdrawal to every sender.

## Common mistakes

- Treating account creation as marketing consent.
- Importing a list without its provenance.
- Recording only a mutable boolean.

## Verification

Pick sample recipients and reconstruct the complete permission history. Confirm a withdrawn purpose cannot be restored by a stale integration.
