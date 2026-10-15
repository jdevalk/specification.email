---
title: SMTP TLS Reporting (TLS-RPT)
category: authentication
summary: Publish a TLS-RPT record so sending servers report failed TLS connections to your mail servers, and read the reports.
status: recommended
order: 5
relatedSlugs: [mta-sts, dane-for-smtp]
sources:
  - title: RFC 8460 — SMTP TLS Reporting
    url: https://www.rfc-editor.org/rfc/rfc8460
    publisher: IETF
---

## What it is

TLS-RPT is a DNS record at `_smtp._tls.example.com` that tells sending servers where to send a daily summary of TLS successes and failures when they deliver to your domain.

## Why it matters

Without reports, a broken certificate, a downgrade attack, or a wrong MTA-STS or DANE record only shows up as mail that never arrives. Reports show the failure from the sender's side, often before anyone complains.

## How to implement

Publish `_smtp._tls.example.com TXT "v=TLSRPTv1; rua=mailto:tls-reports@example.com"` or an HTTPS endpoint. Route the JSON reports to a mailbox or service that parses them, and alert on failure counts rather than reading them by hand.

## Common mistakes

- Publishing the record and never reading the reports.
- Pointing `rua` at a mailbox that rejects large or compressed attachments.
- Rolling out MTA-STS or DANE without reporting in place first.

## Verification

Resolve the TXT record from public DNS, confirm the reporting address accepts mail, and check that reports from large mailbox providers arrive within a few days.
