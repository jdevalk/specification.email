---
title: Tracking pixels and remote images
category: privacy
summary: Treat open tracking as unreliable personal data collection, disclose it, minimise retention, and never make essential behavior depend on it.
status: recommended
order: 1
relatedSlugs: [data-minimisation, consent-provenance]
sources:
  - title: Data protection explained — legitimate interests
    url: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/legitimate-interests/
    publisher: UK Information Commissioner's Office
---

## What it is

A tracking pixel is a recipient-specific remote image whose request records that a client fetched message content.

## Why it matters

The signal can expose timing, address, device, and network data, but proxies and privacy features make it an unreliable measure of human attention.

## How to implement

Document the purpose and lawful basis, collect the least data possible, set short retention, provide appropriate controls, and measure outcomes such as completed actions instead of inferred opens.

## Common mistakes

- Treating every fetch as a human open.
- Embedding raw recipient addresses in image URLs.
- Retaining event-level logs indefinitely.

## Verification

Review the request URL, logged fields, retention jobs, privacy notice, and opt-out behavior. Confirm product logic works when images never load.
