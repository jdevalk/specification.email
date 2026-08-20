---
title: Calendar invitation interoperability
category: automation
summary: Calendar mail must include valid iCalendar data, stable event identifiers, correct methods, time zones, and updates that replace prior versions.
status: recommended
order: 1
relatedSlugs: [mime-multipart, machine-readable-actions]
sources:
  - title: RFC 5545 — Internet Calendaring and Scheduling Core Object Specification
    url: https://www.rfc-editor.org/rfc/rfc5545
    publisher: IETF
  - title: RFC 5546 — iCalendar Transport-Independent Interoperability Protocol
    url: https://www.rfc-editor.org/rfc/rfc5546
    publisher: IETF
---

## What it is

iCalendar encodes event identity, timing, participants, recurrence, and scheduling method in a `text/calendar` MIME part.

## Why it matters

Clients use the machine-readable part to add, update, cancel, and respond to events. A human-readable date alone cannot synchronize calendars.

## How to implement

Use one stable `UID`, increment `SEQUENCE` for material updates, emit the correct `METHOD`, include unambiguous time zones, and pair the part with readable message alternatives.

## Common mistakes

- Creating a new UID for an update.
- Mixing local times with a missing time-zone definition.
- Sending cancellation text without a cancellation object.

## Verification

Import the initial invitation, update, response, recurrence exception, and cancellation in multiple calendar clients. They must modify one event rather than create duplicates.
