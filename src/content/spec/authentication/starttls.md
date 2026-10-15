---
title: STARTTLS on MX hosts
category: authentication
summary: Offer STARTTLS on every MX host with a certificate that matches its hostname and a current TLS configuration, so incoming mail can be encrypted.
status: required
order: 4
relatedSlugs: [mta-sts, dane-for-smtp, tls-reporting]
sources:
  - title: RFC 3207 — SMTP Service Extension for Secure SMTP over TLS
    url: https://www.rfc-editor.org/rfc/rfc3207
    publisher: IETF
  - title: RFC 8996 — Deprecating TLS 1.0 and TLS 1.1
    url: https://www.rfc-editor.org/rfc/rfc8996
    publisher: IETF
  - title: RFC 9325 — Recommendations for Secure Use of TLS and DTLS
    url: https://www.rfc-editor.org/rfc/rfc9325
    publisher: IETF
  - title: RFC 8659 — DNS Certification Authority Authorization (CAA) Resource Record
    url: https://www.rfc-editor.org/rfc/rfc8659
    publisher: IETF
---

## What it is

STARTTLS is the SMTP extension that upgrades a plaintext connection on port 25 to TLS. A receiving MX host advertises it in its `EHLO` response and the sending server switches to TLS before it transmits the message.

## Why it matters

Without it, every message to your domain crosses the internet in plaintext. Mailbox providers flag unencrypted delivery to users, and MTA-STS and DANE cannot work on a host that does not offer TLS.

## How to implement

Advertise `STARTTLS` on every MX host, including backup MX hosts and any run by a filtering provider. Serve a certificate that matches the MX hostname, not only the mail domain, with the complete intermediate chain.

Apply the same TLS parameters as for a website: TLS 1.2 and 1.3 only, no insecure renegotiation, no 0-RTT, extended master secret, a sound cipher order, and adequate certificate key and signature algorithms. [The Website Specification's HTTPS and TLS page](https://specification.website/spec/security/https-tls/) has the full checklist.

Mail differs from the web in one respect. Delivery between servers is opportunistic: a sender that cannot negotiate TLS, or does not trust the certificate, falls back to plaintext, and there is no HSTS to stop it. [MTA-STS](/spec/authentication/mta-sts/) and [DANE](/spec/authentication/dane-for-smtp/) are what make TLS mandatory for your domain. STARTTLS is the prerequisite for both.

### CAA for MX hosts

Publish [CAA records](https://specification.website/spec/security/caa-records/) for the domain your MX hostnames live under, naming the CAs allowed to issue their certificates. This applies when the MX hosts sit under a different domain than your website.

RPKI for the prefixes your mail servers announce is covered in [The Website Specification's RPKI page](https://specification.website/spec/security/rpki/).

## Common mistakes

- Offering STARTTLS on the primary MX but not on a backup MX, which attackers and misrouted mail then use.
- Serving a self-signed or expired certificate, or one for the mail domain instead of the MX hostname.
- Omitting the intermediate certificate, so stricter senders cannot build the chain.
- Keeping TLS 1.0 or 1.1 enabled for old senders long after they are gone.
- Assuming STARTTLS alone protects delivery when nothing requires senders to use it.

## Verification

Connect with `openssl s_client -starttls smtp -connect mx.example.com:25` for each MX, confirm `STARTTLS` appears after `EHLO`, and check the certificate name, chain, and expiry. Run a TLS scanner or Internet.nl's mail test against every MX host and compare the results with the website checklist.
