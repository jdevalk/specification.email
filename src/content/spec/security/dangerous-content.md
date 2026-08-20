---
title: Dangerous active email content
category: security
summary: Do not depend on scripts, forms, embedded credentials, or untrusted active content; sanitise generated HTML and provide safe web fallbacks.
status: avoid
order: 3
relatedSlugs: [safe-links, robust-layout]
sources:
  - title: HTML Standard — The script element
    url: https://html.spec.whatwg.org/multipage/scripting.html#the-script-element
    publisher: WHATWG
---

## What it is

Active content includes executable scripts, forms, plugins, and embedded contexts that can collect or change data from inside the message.

## Why it matters

Clients strip or block these features because email crosses trust boundaries. Depending on them creates both security risk and broken messages.

## How to implement

Generate a constrained HTML subset, escape untrusted values, remove executable elements and event handlers, and move interactive or authenticated workflows to a secure website.

## Common mistakes

- Assuming a template engine escapes URL and HTML contexts equally.
- Embedding login forms or asking recipients to reply with secrets.
- Treating client-side stripping as the sanitization layer.

## Verification

Run the final HTML through an allowlist sanitizer in tests and scan for scripts, forms, event attributes, unsafe URL schemes, and embedded credentials.
