---
title: DANE for SMTP
category: authentication
summary: Publish DNSSEC-signed TLSA records for your MX hosts so sending servers can verify their certificates without trusting the CA system alone.
status: recommended
order: 7
relatedSlugs: [starttls, mta-sts, tls-reporting]
sources:
  - title: RFC 7672 — SMTP Security via Opportunistic DANE TLS
    url: https://www.rfc-editor.org/rfc/rfc7672
    publisher: IETF
  - title: RFC 6698 — The DNS-Based Authentication of Named Entities (DANE) TLSA Protocol
    url: https://www.rfc-editor.org/rfc/rfc6698
    publisher: IETF
  - title: RFC 7671 — Updates and Operational Guidance for DANE
    url: https://www.rfc-editor.org/rfc/rfc7671
    publisher: IETF
---

## What it is

DANE publishes the expected certificate or public key of each MX host as a TLSA record at `_25._tcp.mx.example.com`. Because the record is signed with DNSSEC, a sending server can trust it and must use TLS with a matching certificate.

## Why it matters

It closes the same downgrade gap as MTA-STS, but through DNS instead of a web server, and it does not depend on a sender trusting every public CA. Several mailbox providers and governments validate it by default.

## How to implement

Each MX host must already offer [STARTTLS](/spec/authentication/starttls/). Sign both the domain and the MX host's zone with DNSSEC. Publish a `3 1 1` TLSA record (SHA-256 of the server's public key) for each MX, or `2 1 1` for the issuing CA. Before a key or certificate changes, publish the new record next to the old one and wait at least the record's TTL before switching.

## Common mistakes

- Publishing TLSA records in a zone that is not DNSSEC-signed, so nobody can use them.
- Rotating the key before the new TLSA record is published, which makes compliant senders stop delivering.
- Pinning a `3 1 1` record to a certificate whose key changes on every automatic renewal.
- Forgetting MX hosts run by another provider, who must publish their own records.

## Verification

Query the TLSA records with a validating resolver, check that the DNSSEC chain is intact, and compare the hash with each MX's certificate after STARTTLS. Read TLS reports for `tlsa-invalid` or `dnssec-invalid` failures.
