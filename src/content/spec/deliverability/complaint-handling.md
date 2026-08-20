---
title: Spam complaint handling
category: deliverability
summary: Subscribe to available feedback loops, connect complaints to recipients safely, suppress them promptly, and monitor complaint rates by message stream.
status: required
order: 3
relatedSlugs: [list-hygiene, one-click-unsubscribe]
sources:
  - title: Complaint Feedback Loop operational recommendations
    url: https://www.m3aawg.org/sites/default/files/m3aawg-feedback-loop-best-common-practices-2018-07.pdf
    publisher: M3AAWG
---

## What it is

Some mailbox providers report when a recipient marks a message as spam. Complaint handling converts those reports into suppression and operational insight.

## Why it matters

Mailing a complainer again ignores an explicit negative signal and increases the chance that all mail from the stream is filtered.

## How to implement

Register authenticated domains for feedback loops, map reports to internal recipients without leaking personal data, suppress immediately, and segment metrics by source, campaign, and acquisition path.

## Common mistakes

- Treating complaints as a dashboard metric but not a suppression event.
- Logging entire message bodies unnecessarily.
- Averaging transactional and marketing streams together.

## Verification

Inject a synthetic complaint into the processing path and confirm the address cannot be queued again from any sending application.
