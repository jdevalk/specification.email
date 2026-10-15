---
title: STARTTLS and IPv6 for mail servers
date: "2026-10-15"
type: added
relatedSlugs: [starttls, reverse-dns]
---

[STARTTLS on MX hosts](/spec/authentication/starttls/) is a new required topic: every MX offers TLS with a certificate for its own hostname, TLS parameters follow the website checklist, and MTA-STS and DANE make it mandatory. [Reverse DNS](/spec/deliverability/reverse-dns/) now covers IPv6: MX hosts reachable over IPv6, and the stricter rules for sending over it.
