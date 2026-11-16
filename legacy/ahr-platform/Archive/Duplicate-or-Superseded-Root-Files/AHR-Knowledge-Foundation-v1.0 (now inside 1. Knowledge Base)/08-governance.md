# AHR Governance

**Source lineage:** Project Rules, Documentation Workflow (Phase 0); Platform Philosophy (Phase 1); Brand Governance (Phase 2); Platform Policies & Exception Handling (Phase 6); Future Evolution Strategy (Phase 9). This document extends the same governance discipline that produced Phases 0–9 to this Knowledge Foundation itself — the Foundation is governed by its own rules, not exempt from them.

---

## Decision-Making Rules

1. **One final decision-maker.** Ahmed Hamdy Raouf alone approves any final decision, at any stage, for any document. This does not change as AHR grows.
2. **Dual review before approval.** Substantive decisions are reviewed analytically (by Claude, and by ChatGPT when engaged) before reaching the final decision-maker — review informs the decision, it never substitutes for it.
3. **No retreat without an explicit decision.** A new idea is recorded in the Backlog; it does not change the order or content of an already-locked phase or document unless the platform owner explicitly decides to reopen it.
4. **An exception is not a precedent.** Per Platform Policies & Exception Handling, a documented exception addresses one specific case — it does not silently become a new general rule through repetition. Repeated exceptions trigger an architectural review to decide whether they should formally change the rule; they do not change it by accumulation alone.

---

## Documentation Ownership

- **The platform owner (Ahmed Hamdy Raouf)** owns every document's final content and approval.
- **Reviewers (Claude, and ChatGPT when engaged)** own the quality of analysis and critique offered before a decision — never the decision itself.
- **There is no other stakeholder with document-editing authority** in Version 1's governance model. If future roles (an editorial team, delegated reviewers) are introduced, that is itself a governance decision requiring the same process as any other, not an informal expansion.

## Documentation States

Every document — including this Knowledge Foundation and each file in it — exists in exactly one of three states, always shown explicitly:

| State | Meaning |
|---|---|
| 🟡 **Working** | Still under discussion; not yet a reliable reference. |
| 🟢 **Approved** | Adopted; safe to build on. |
| 🔒 **Locked** | Finalized; changeable only through an explicit decision from the platform owner. |

## Version Control for Knowledge

**There is no "v1" and "v2" of any single document.** Each document is the one official reference for its subject. A future revision edits the same file — it does not create a parallel version, a "final-final," or a dated copy living alongside the original. (This applies to individual documents; this Knowledge Foundation *package* as a whole is versioned — v1.0, and a future v1.1/v2.0 if this package itself is substantially revised — but the documents inside it follow the single-file rule once established.)

## Approval Workflow

```
① The project owner drafts or reviews a document and gives an engineering opinion
        ↓
② Claude reviews, critiques, and suggests improvements
        ↓
③ The project owner compares the input and makes the final decision
```

## Review Workflow (for a Locked Document)

Reopening a Locked document requires: an explicit, stated reason (not a passing new idea); review of the change's effect on every document that depends on it (per each document's own "Dependencies" record); the same dual-review-then-owner-approval path as any new decision; and, once re-approved, the document is re-locked and every document that references it is checked for consistency — Consistency Before Speed applies here exactly as it does everywhere else in Platform Philosophy.

## Future Documentation Process

When a new document is needed (a new phase, a new component's architecture, an amendment to this Foundation):

1. It is drafted with an explicit "Dependencies" note — which existing, locked documents it builds on and must remain consistent with.
2. It goes through the same Approval Workflow above.
3. On approval, it is locked and any documents referencing its subject are updated to point to it — never left contradicting a newer, approved decision.
4. At the close of a body of related work (a Phase, or a major addition to this Foundation), its final approved documents are packaged together, without drafts or superseded versions, the same way each Phase 0–9 package was assembled.

---

## Governance of This Knowledge Foundation Specifically

This Foundation is itself subject to every rule above, with two additions specific to its role as the ecosystem's Source of Truth:

1. **Any new entity, business rule, or terminology added anywhere in AHR's products must first exist here**, or be added here concurrently — a feature that introduces a concept this Foundation doesn't yet define is, by definition, introducing an undocumented decision, which Documentation First treats as if it hasn't been made.
2. **A conflict between this Foundation and any technical release (e.g., the Platform v1.0 release package) is resolved by asking which one reflects an actual approved decision** — if the software correctly implements something this Foundation hasn't yet caught up to documenting, the Foundation is updated to match reality; if the software deviates from an actual Business Rule or Domain Model decision without a documented, approved exception, the software is the one that needs correcting, not this Foundation.

## Architectural Debt (Applied to Knowledge, Not Just Code)

Just as Future Evolution Strategy defines architectural debt for software as a deliberate, temporary, explicitly documented deviation — the same concept applies to this Foundation. If time pressure ever forces publishing content, running a business process, or shipping a feature ahead of this Foundation fully covering it, that gap is documented explicitly as a debt with a plan to close it — never left as a silent, permanent gap discovered later by accident.
