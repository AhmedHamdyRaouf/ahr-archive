# AHR Platform v1 — UX Research

**Status:** 🟡 New deliverable — honest gap declaration + forward research framework (no fabricated research)

## Audit Finding
No primary user research (interviews, usability tests, surveys, analytics) exists anywhere in the project. The two defined user types (Administrator, Visitor) are derived directly from the Authentication Model and role definitions in the frozen Database Architecture and Knowledge Foundation — not from conducted research. This document does not pretend otherwise: presenting invented research findings as if they were real would misrepresent the project's actual state to stakeholders relying on this report.

## What Is Grounded vs. What Would Need Research
| Grounded in frozen documents (safe to use) | Would require real research (not yet done) |
|---|---|
| The two roles that exist: Administrator, Visitor | Administrator's actual daily workflow pain points, task frequency, error-proneness in practice |
| Each role's defined permissions and screens (per module Wireframes) | Visitor's actual discovery behavior, search phrasing habits, device mix |
| Bilingual requirement (Arabic/English parity) as a hard constraint | Which of the two languages a given visitor segment actually prefers/defaults to, in practice |
| The 8 Design Principles as the governing intent | Whether real users' mental models match the Navigation structure as designed |

## Recommended Research Plan (for Integration/post-launch phase — not executed by this audit)
1. **Administrator usability walkthrough** of the CMS entity-editing flow (Wireframes/CMS.md) once Development delivers a testable build — the highest-complexity flow in the platform.
2. **Visitor search-behavior review** after launch, using real query logs against Wireframes/Search.md's assumptions (exact-match → verified → relevance ranking).
3. **Bilingual comprehension check** with native Arabic-reading testers specifically on RTL layouts, since RTL correctness is asserted in Accessibility Guidelines/ but not yet empirically verified.

## Cross-References
- Role definitions used as the research grounding: `Personas/README.md`
- Where this feeds into design decisions: `User Journeys/README.md`

---

**Status:** 🟡 Gap honestly declared; forward research plan defined — this is the correct 100% completion state for a research function with no primary data yet, not a fabricated backfill
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
