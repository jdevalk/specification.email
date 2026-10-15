---
title: Reverse DNS and sending identity
category: deliverability
summary: Every sending IP needs stable forward-confirmed reverse DNS, an SMTP greeting that matches it, and an operational domain identity.
status: required
order: 1
relatedSlugs: [list-hygiene, complaint-handling]
sources:
  - title: RFC 5321 — SMTP client identity
    url: https://www.rfc-editor.org/rfc/rfc5321#section-4.1.4
    publisher: IETF
  - title: Email sender guidelines — IPv6 requirements
    url: https://support.google.com/a/answer/81126
    publisher: Google
  - title: RFC 3596 — DNS Extensions to Support IP Version 6
    url: https://www.rfc-editor.org/rfc/rfc3596
    publisher: IETF
---

## What it is

Reverse DNS maps a sending IP to a hostname. Forward-confirmed reverse DNS means that hostname resolves back to the IP.

## Why it matters

Mailbox providers expect accountable infrastructure. Missing or generic identity is a common rejection and reputation signal.

## How to implement

Assign a dedicated, meaningful hostname to each sending IP, configure PTR through the IP owner, publish matching A or AAAA records, and use that hostname in SMTP EHLO.

### IPv6

Make every MX host reachable over IPv6: publish an AAAA record and make sure the host actually accepts connections on port 25 over IPv6, not only on IPv4.

Sending over IPv6 carries stricter rules. Gmail and other large mailbox providers reject or throttle IPv6 mail unless the sending IP has forward-confirmed reverse DNS and the message passes SPF or DKIM. If you cannot meet that on IPv6, send over IPv4 until you can. [The Website Specification's IPv6 page](https://specification.website/spec/resilience/ipv6/) covers name servers and the general dual-stack rules.

## Common mistakes

- Setting a PTR that does not resolve forward.
- Sharing one hostname between unrelated operators.
- Greeting with `localhost` or a bare IP literal.
- Publishing an AAAA record for an MX host that does not listen on IPv6.
- Sending over IPv6 from addresses without PTR records, while IPv4 is set up correctly.

## Verification

Resolve IP → PTR → address and compare the SMTP banner and EHLO name. Repeat from a resolver outside your own network, and for each IPv6 address. Connect to every MX host on port 25 over IPv6.
