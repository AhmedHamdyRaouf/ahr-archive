# AHR Platform v1 — Personas

**Status:** 🟡 Role-based personas (grounded in the frozen Authentication Model), not research-based psychographic personas

## Important Framing
AHR Platform v1 defines exactly two user roles in its frozen Authentication Model and Database Architecture — Administrator and Visitor. No user research (see `UX Research/README.md`) exists to support inventing named individuals with biographical detail, quotes, or psychographic traits — doing so would present fiction as research, which this audit will not do. What follows are **role-based personas**: a working-practice substitute that is honest about its own basis.

## Persona 1 — The Administrator
**Basis:** Authentication Model (single role in V1), CMS/Dashboard/Contacts & Organizations/Media Library module purposes.
- **Who:** The one operator role in V1 — manages every Archive entity, moderates content, configures platform settings.
- **Primary goals:** Get accurate bilingual content published efficiently; keep the trust signals (status/verification) correct; resolve moderation reports before they pile up.
- **Context of use:** A working tool used repeatedly, task-focused, not browsed casually — this is why Dashboard UX Guidelines call for "direct, efficient, no marketing language."
- **Pain points implied by the spec itself:** Dense entity forms with many required relationships (e.g. a Work needs a Contribution before it can publish) — friction here is intentional (Design Principles §5), so the design goal is *making the requirement clear*, not removing it.
- **Design implications already reflected in Wireframes/CMS.md and Dashboard Designs/:** predictable pagination over infinite scroll, visible validation before a blocked Publish action, no destructive action without confirmation.

## Persona 2 — The Visitor
**Basis:** Website module purpose, public/published-only access model, bilingual requirement.
- **Who:** An unauthenticated member of the public — the only other user type the frozen scope defines. No further segmentation (e.g. "researcher" vs. "casual browser") exists in any frozen document; inventing sub-segments here would exceed this audit's authority.
- **Primary goals:** Discover and read credible, verified content about People/Works/Projects/Events/Recognition; find something specific via Search; read in their preferred language without friction.
- **Context of use:** Browsing, not transacting — no forms beyond Search and (if clarified later) Contact.
- **Design implications already reflected in Website Designs/ and Wireframes/Search.md:** verification is visible without needing to seek it out; empty/zero-result states suggest a next step rather than dead-ending; locale switch is instant and available on every page.

## What This Audit Does Not Add
Additional personas (e.g. "Researcher," "Press," "Prospective Student") are not defined anywhere in frozen scope — introducing them here would be a Feature/scope addition outside v1.0. Any such idea is logged in `Backlog.md`, not designed against.

---

**Status:** 🟡 Complete for the two roles that actually exist in scope; expansion requires both real research and a scope decision — both flagged forward
**Reviewed By:** Chief Experience & Design Officer (this audit)
**Approved By:** Pending
