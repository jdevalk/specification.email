---
title: Safe and usable email attachments
category: automation
summary: Attach only necessary files with accurate media types, safe names, bounded size, malware controls, and an accessible alternative where possible.
status: recommended
order: 3
relatedSlugs: [mime-multipart, dangerous-content]
sources:
  - title: RFC 2183 — Content-Disposition header field
    url: https://www.rfc-editor.org/rfc/rfc2183
    publisher: IETF
  - title: RFC 2231 — MIME parameter value extensions
    url: https://www.rfc-editor.org/rfc/rfc2231
    publisher: IETF
---

## What it is

Attachments are MIME body parts with a media type, content disposition, transfer encoding, and optional filename parameters.

## Why it matters

Large or dangerous attachments trigger filtering and create accessibility, privacy, and device-storage costs.

## How to implement

Set an accurate content type, sanitize the filename, encode international names correctly, scan generated and uploaded files, limit size, and prefer authenticated download links for sensitive or changing documents.

## Common mistakes

- Trusting an uploaded file extension as its media type.
- Including personal data in the filename.
- Attaching inaccessible image-only PDFs.

## Verification

Open the delivered file on multiple platforms, inspect MIME metadata, test a non-ASCII filename, and confirm malware and size controls execute before queueing.
