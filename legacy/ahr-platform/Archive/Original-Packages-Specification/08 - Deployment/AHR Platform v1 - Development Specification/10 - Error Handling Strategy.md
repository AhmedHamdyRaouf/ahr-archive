# AHR Platform v1 — Error Handling Strategy

**Status:** 🔒 Frozen

## Single Error Vocabulary

Every error, anywhere in the system, uses the codes defined in `12 - Error Codes.md` (API Specification). No package invents its own error code namespace.

## Layered Handling

```
① Database constraint (check/FK) — the last-resort backstop, per Data Foundation Conventions
② packages/content (or the relevant owning package) validation — same rule, checked earlier,
   for a clear typed error (MISSING_CONTRIBUTION, OWNER_CONSTRAINT_VIOLATION, etc.)
③ Route Handler/Server Action — catches ②'s typed error, shapes it into the API envelope
④ Frontend — maps the error code to pre-written, localized user-facing copy (08 - API Integration Rules)
```

A developer relying only on layer ① (letting the database reject bad data with a raw constraint error) is not meeting this strategy — layer ② must catch it first with a meaningful message, per Development Principles §2.

## Never Expose Internals

No stack trace, database error string, or third-party provider (Supabase/OpenAI) error message ever reaches the client directly — always translated to a code from `12 - Error Codes.md` first (Packages Specification, repeated across every package's own §19).

## Logging on Error

Every `500 INTERNAL_ERROR` is logged server-side with full detail (11 - Logging Strategy) before being reduced to a generic message for the client — the detail isn't lost, it's just not sent over the wire.

## Security-Sensitive Errors

Authentication-related errors (login, password reset) are deliberately generic even at the typed-error level — `UNAUTHENTICATED` never distinguishes "wrong password" from "no such account" in its message (Authentication API §19, carried through unchanged here).

## Partial Failure

Where a single request touches multiple things (e.g. an upload that succeeds in Storage but fails to write the `media_asset` row) the system must not leave an orphaned half-state — either the whole operation succeeds or it's rolled back/cleaned up (Packages Specification Package 08 §19, generalized as a platform-wide rule here).

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Architecture Review
**Dependencies:** Error Codes (API Specification 12), Backend Development Rules (06)
