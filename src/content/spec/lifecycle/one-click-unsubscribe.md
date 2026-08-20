---
title: One-click list unsubscribe
category: lifecycle
summary: Bulk subscription mail needs authenticated one-click unsubscribe headers that complete without login, redirects, confirmation pages, or extra choices.
status: required
order: 1
relatedSlugs: [list-unsubscribe, consent-provenance]
sources:
  - title: RFC 8058 — One-Click Functionality for List Email Headers
    url: https://www.rfc-editor.org/rfc/rfc8058
    publisher: IETF
---

## What it is

RFC 8058 defines a POST-based one-click mechanism using `List-Unsubscribe` and `List-Unsubscribe-Post`, protected by a valid DKIM signature.

## Why it matters

Mailbox interfaces can offer a trusted unsubscribe action without following message-body links, reducing complaints and friction.

## How to implement

Provide an HTTPS URI in `List-Unsubscribe`, add `List-Unsubscribe-Post: List-Unsubscribe=One-Click`, include both fields in DKIM signing, and process the POST without authentication or user interaction.

## Common mistakes

- Redirecting the POST to a login page.
- Using the same token for unrelated subscription scopes.
- Forgetting to sign the list headers.

## Verification

POST the specified form body to the delivered header URL and confirm a successful response plus prompt suppression for the intended list.
