# AHR Design Principles

**Source lineage:** UX Principles, Navigation Architecture, Information Presentation, Design System Foundations (Phase 7); Visual Identity Rules, Identity Principles (Phase 2); Navigation System, Information Architecture (Phase 3). Like their source documents, these are structural principles — categories and roles, not final colors, fonts, or a specific layout. Visual Identity's actual values (colors, typography, logo) remain a deliberate creative decision outside architecture's scope, tracked as Known Limitation B10 in the Platform v1.0 release.

---

## UX Principles

Information Architecture (Phase 3) defined *what exists* — the pages, the classification, the search, the user journeys as steps. Design Principles define *how that structure is experienced* — its felt, interactive quality. This is not a re-definition of structure; it is the quality layer on top of it.

1. **Clarity before beauty.** Every experience decision is tested for clarity of understanding first, before visual appeal.
2. **Trust through transparency.** Any experience displaying AI-generated content states that explicitly — it is never hidden or blended in as if human-authored.
3. **Bilingual parity.** The Arabic and English experiences are equal in quality and clarity — neither is a primary version with a secondary translation.
4. **Minimum friction for trust.** Verification and human-review steps are presented as a natural part of the experience, not as bureaucratic obstacles the user must fight through.
5. **Consistency across brands.** Any Sub-Brand's experience carries the same baseline quality as AHR's Master Brand experience, even where the context differs.

## Navigation Principles

1. **Spatial continuity.** A user always feels where they are within the structure, without needing to manually remember the path.
2. **Safe return.** Every navigation step can be confidently reversed, without losing context or in-progress data.
3. **Clear current-context signaling.** A user always knows which Sub-Brand or section they are in — never disoriented between Academy, Archive, and Creative Network.
4. **Non-intrusive contextual navigation.** Related links are offered as an invitation to explore, never as a distraction from the user's primary task.
5. **Consistent regardless of device.** The same clarity of location and same ease of return apply whether the interaction is a swipe, a tap, or a scroll — device-specific technical detail is a later, separate concern.

## Information Architecture Principles

1. **Hierarchy of importance.** The most important fact about any entity (a Work's title, a Person's primary role) always appears first, before secondary detail — regardless of entity type.
2. **Group by relationship, not just chronology.** Logically related information (every Contribution to one Work) is presented grouped, not scattered by entry date.
3. **Progressive disclosure.** Dense detail (full metadata, historical record) is available on request, not dumped all at once in a way that overwhelms reading.
4. **Visible verification signaling.** Any difference in Verification Status is shown with a clear, plain-language indicator — never a raw technical term the general user wouldn't understand.
5. **Category vs. Tag presentation differs by design, matching their conceptual difference.** Hierarchical Category is presented as a browsable path (breadcrumb-like); free-form Tags are presented as horizontal, freely explorable elements.

## Accessibility Principles

Minimum acceptable color contrast; full screen-reader support for documentary text; status is never indicated by color alone — always paired with an icon or text label, so no state is invisible to a user who cannot perceive that color distinction.

## Responsive Principles

Structural navigation and information-presentation principles above are device-independent by design — the felt quality of clarity, hierarchy, and safe return holds on any device; only the specific technical execution (breakpoints, touch targets) is a later, separate implementation decision, never a change to the principle itself.

## Typography Philosophy

- **A clear heading scale** — distinct hierarchical levels (primary heading, subheading, label) reflecting Information Presentation's importance hierarchy.
- **A body-text scale optimized for long reading** — biographies, work descriptions — kept separate from the heading scale.
- **Independent bilingual support** — a scale that adapts between Arabic and Latin scripts without breaking the hierarchy between them. Arabic is not simply Latin typography mirrored; it is a first-class, independently considered scale.

## Visual Consistency Rules

1. Every Sub-Brand must be visually distinguishable, yet remain recognizable as part of AHR — no sub-brand identity may be so independent that the public can no longer connect it to AHR.
2. There is no fully separate visual system for any Sub-Brand. Any sub-brand visual element is built as an extension of the Master Brand's visual system, never a parallel one.
3. The Foundational Personal Brand may carry a warmer, more personal visual character, but stays within the boundaries the overall AHR visual system sets — never outside them.
4. Any new visual element — for an existing or future brand — passes through Brand Governance before adoption; it is never built or published independent of that review.
5. **Motion serves understanding, not decoration.** Any animation clarifies a transition or draws attention to a real update; motion that serves no clarity has no architectural justification.
6. **An AI confidence indicator is contextual, not a mandatory recurring component.** It appears only where AI's confidence materially affects a user's understanding or decision — the architecture does not mandate a persistent confidence visualization platform-wide; low-impact contexts (a simple ranking suggestion) need only a brief textual disclosure, no permanent visual indicator.

## Content Presentation Rules

Category is presented as a browsable hierarchy; Tag is presented as free, horizontally explorable descriptors — this distinction in presentation is a direct, required reflection of their conceptual difference (`02-domain-model.md`), never flattened into one generic "labels" treatment.

---

## Note on What This Document Deliberately Excludes

Per Visual Identity Rules' own explicit deferral, **no actual color values, font names, or logo exist in this document** — those are a creative decision made once, separately, and bound by the five Visual Consistency Rules above, not invented here. AHR Platform v1.0's own `@ahr/site` theme-token catalog implements this exact deferral pattern in code: category placeholders (Primary, Secondary, Semantic, Neutral) with no real values, pending that same creative decision.
