---
title: Recipient data minimisation
category: privacy
summary: Put only necessary personal data in message bodies, headers, links, logs, and provider metadata, with explicit retention for each copy.
status: required
order: 2
relatedSlugs: [tracking-pixels, safe-links]
sources:
  - title: GDPR Article 5 — Principles relating to processing
    url: https://eur-lex.europa.eu/eli/reg/2016/679/art_5/oj
    publisher: European Union
---

## What it is

Data minimisation limits personal data to what is adequate, relevant, and necessary for the message and its operational obligations.

## Why it matters

Email is copied across queues, relays, mailboxes, backups, logs, and notification previews. Every extra field increases exposure.

## How to implement

Prefer secure account links over full records, redact logs, avoid personal data in URLs and subjects, and define retention for delivery events and rendered content.

## Common mistakes

- Placing account or health details in the subject line.
- Using an email address as a tracking token.
- Sending complete records when a notification is sufficient.

## Verification

Inventory personal fields in raw source, URLs, provider tags, logs, and webhooks. For each field, record its purpose, access, and deletion rule.
