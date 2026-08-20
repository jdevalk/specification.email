---
title: Machine-readable email actions
category: automation
summary: Add structured actions only as progressive enhancement, bind them to visible content, and keep the ordinary website workflow complete.
status: optional
order: 2
relatedSlugs: [calendar-invitations, safe-links]
sources:
  - title: Schema.org EmailMessage
    url: https://schema.org/EmailMessage
    publisher: Schema.org
  - title: Email markup overview
    url: https://developers.google.com/gmail/markup/overview
    publisher: Google
---

## What it is

Some mailbox providers recognize JSON-LD or microdata describing reservations, orders, confirmations, and actions associated with a message.

## Why it matters

Structured data can expose useful actions in a mailbox UI, but support is provider-specific and often requires sender registration.

## How to implement

Describe the same entity and action the recipient can see, use canonical HTTPS destinations, meet provider authentication requirements, and keep the normal message and website fully functional.

## Common mistakes

- Marking up an action not present in the message.
- Treating provider approval as a web standard.
- Putting secrets in visible structured data.

## Verification

Validate the markup, send through the provider's approved production path, and confirm unsupported clients simply ignore it without losing function.
