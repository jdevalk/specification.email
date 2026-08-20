---
title: DomainKeys Identified Mail signatures
category: authentication
summary: Sign outgoing mail with DKIM using aligned domains, protected private keys, rotating selectors, and canonicalization that survives normal transit.
status: required
order: 2
relatedSlugs: [sender-policy-framework, dmarc-policy]
sources:
  - title: RFC 6376 — DomainKeys Identified Mail Signatures
    url: https://www.rfc-editor.org/rfc/rfc6376
    publisher: IETF
---

## What it is

DKIM adds a domain signature over selected headers and the body. The public key is retrieved from DNS using a selector.

## Why it matters

It proves that an authorized holder of the domain key signed content that has not materially changed. Unlike SPF, it can survive forwarding.

## How to implement

Sign with a domain aligned to the visible `From`, include important identity and subject fields, protect private keys, and use selectors that allow rotation without downtime.

## Common mistakes

- Reusing one private key indefinitely.
- Signing with a provider domain that cannot align with DMARC.
- Letting a gateway modify signed content after signing.

## Verification

Query the selector record and inspect a delivered message for `dkim=pass`. Change one signed byte in a test fixture and confirm verification fails.
