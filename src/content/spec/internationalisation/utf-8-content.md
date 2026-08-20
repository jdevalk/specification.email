---
title: UTF-8 message content
category: internationalisation
summary: Encode international text consistently as UTF-8 across headers and bodies, with MIME declarations and transfer encodings that preserve every character.
status: required
order: 1
relatedSlugs: [language-direction, international-addresses]
sources:
  - title: RFC 6532 — Internationalized Email Headers
    url: https://www.rfc-editor.org/rfc/rfc6532
    publisher: IETF
---

## What it is

UTF-8 represents text from many writing systems. MIME parameters and encoded header syntax tell recipients how to decode those bytes.

## Why it matters

Encoding mismatches turn names, subjects, currencies, and legal copy into replacement characters or mojibake.

## How to implement

Use UTF-8 end to end, declare it on text MIME parts, encode legacy-constrained headers with a maintained library, and choose quoted-printable or base64 when transport needs it.

## Common mistakes

- Declaring UTF-8 after encoding from a legacy code page.
- Counting characters where a protocol limit counts bytes.
- Truncating inside a multibyte sequence.

## Verification

Send fixtures containing accented Latin, Arabic, CJK, emoji, and combining marks. Compare raw and rendered values at each delivery hop.
