---
title: Safe and trustworthy email links
category: security
summary: Link text, visible domains, redirects, and destination context must agree, while sensitive actions require fresh server-side authorization.
status: required
order: 2
relatedSlugs: [header-injection, data-minimisation]
sources:
  - title: Digital Identity Guidelines — Authentication and authenticator management
    url: https://pages.nist.gov/800-63-4/sp800-63b.html
    publisher: NIST
---

## What it is

Email links bridge an untrusted message-rendering environment and a web application. The link itself may carry a short-lived capability or only a route to authentication.

## Why it matters

Misleading labels train recipients to ignore phishing signals. Long-lived bearer URLs leak through forwarding, logs, previews, and referrers.

## How to implement

Use HTTPS, recognizable first-party domains, honest link labels, short-lived single-purpose tokens, and server-side checks before sensitive changes. Offer a path through the normal site for cautious users.

## Common mistakes

- Showing one domain while linking to another.
- Putting personal data or permanent credentials in query strings.
- Completing destructive actions on a GET request.

## Verification

Inspect rewritten delivered URLs, follow them while logged out and in the wrong account, reuse expired tokens, and confirm state changes require the intended authorization.
