---
title: Considered-and-excluded entries exposed to the MCP server
date: "2026-08-20"
type: added
relatedSlugs: [dmarc-policy]
---

Search over the MCP and A2A endpoints now covers the decision register as well as the specification itself. Asking about a technology that was evaluated and deliberately left out — BIMI, AMP for Email, read receipts — returns the recorded reason and its revisit condition under a separate heading, instead of reporting no match at all. Excluded entries are never presented as requirements.
