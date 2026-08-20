---
title: Required message header fields
category: foundations
summary: Each message needs a valid Date, From, and globally unique Message-ID, with recipient and subject fields that match its purpose.
status: required
order: 2
relatedSlugs: [message-format, header-injection]
sources:
  - title: RFC 5322 — Originator and destination fields
    url: https://www.rfc-editor.org/rfc/rfc5322#section-3.6
    publisher: IETF
---

## What it is

Header fields identify the author, creation time, recipients, subject, and message instance. `Date` and `From` are required by the Internet Message Format; a stable, unique `Message-ID` supports threading and diagnostics.

## Why it matters

Missing or contradictory identity fields look suspicious to filters and confuse recipients. Duplicate message identifiers can collapse unrelated messages into one thread.

## How to implement

Set one valid `From`, an accurate `Date`, and a new `Message-ID` for each logical message. Use `Reply-To` only when replies should go elsewhere. Keep the visible identity consistent with the authenticated domain.

## Common mistakes

- Reusing a `Message-ID` across retries that contain different content.
- Putting a recipient list in visible `To` when it should be private.
- Using a no-reply address when replies are an expected support path.

## Verification

View raw source in two mailbox providers. Confirm the fields parse, represent the intended identities, and produce the expected reply and thread behavior.
