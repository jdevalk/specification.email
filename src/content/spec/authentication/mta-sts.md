---
title: SMTP MTA Strict Transport Security (MTA-STS)
category: authentication
summary: Publish an MTA-STS policy so sending servers require valid TLS to your MX hosts instead of silently falling back to plaintext.
status: recommended
order: 4
relatedSlugs: [tls-reporting, dane-for-smtp]
sources:
  - title: RFC 8461 — SMTP MTA Strict Transport Security (MTA-STS)
    url: https://www.rfc-editor.org/rfc/rfc8461
    publisher: IETF
  - title: RFC 3207 — SMTP Service Extension for Secure SMTP over TLS
    url: https://www.rfc-editor.org/rfc/rfc3207
    publisher: IETF
---

## What it is

MTA-STS lets a receiving domain declare that its MX hosts support TLS with a valid certificate. The policy lives at `https://mta-sts.example.com/.well-known/mta-sts.txt` and a `_mta-sts` TXT record announces its version.

## Why it matters

Opportunistic STARTTLS can be stripped by anyone on the path, and the sender falls back to plaintext without telling anyone. An enforced policy makes senders refuse delivery to a host that cannot prove it is the real MX.

## How to implement

Give every MX host a certificate from a public CA that matches its hostname. Serve the policy over HTTPS with `version: STSv1`, `mode`, every `mx` pattern, and `max_age`. Publish `_mta-sts.example.com TXT "v=STSv1; id=…"` and change the `id` whenever the policy changes. Start in `testing` mode with TLS reporting, then move to `enforce`.

## Common mistakes

- Leaving the policy in `testing` mode for good.
- Adding or renaming an MX host without updating the `mx` lines.
- Updating the policy file but not the `id`, so senders keep the cached version.
- Serving the policy from a host whose own certificate is invalid.

## Verification

Fetch the policy over HTTPS, confirm every current MX matches an `mx` line, and check each MX presents a valid certificate after STARTTLS. Watch TLS reports for failures before and after switching to `enforce`.
