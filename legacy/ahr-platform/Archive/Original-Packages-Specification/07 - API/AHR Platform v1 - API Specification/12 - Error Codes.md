# AHR Platform v1 — Error Codes

**Status:** 🔒 Frozen

## Error Object Shape

```
{
  "code": "STRING_CONSTANT",
  "message": "Human-readable, safe to display",
  "details": { ... optional, field-level info ... }
}
```

Never a raw database error, stack trace, or provider (Supabase/OpenAI) error message passed through directly to the client (Packages Specification, multiple §19 sections).

## Standard Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHENTICATED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Valid session, insufficient role/ownership |
| `NOT_FOUND` | 404 | Resource does not exist (or is not visible to this caller — a Visitor requesting a Draft resource gets `NOT_FOUND`, not `FORBIDDEN`, to avoid confirming its existence) |
| `VALIDATION_ERROR` | 422 | Request body failed field-level validation; `details` lists each failing field |
| `INVALID_STATUS_TRANSITION` | 409 | Requested lifecycle transition skips a stage or is otherwise not allowed (Entity Lifecycles & State Transitions, Phase 6) |
| `MISSING_CONTRIBUTION` | 422 | A Work/Project/Event publish attempt with no linked Contribution (Data Integrity Rules, Phase 4) |
| `TAXONOMY_DOMAIN_MISMATCH` | 422 | A Category's `domain` doesn't match the entity type it's being assigned to |
| `OWNER_CONSTRAINT_VIOLATION` | 422 | A `media_asset`/`press_mention` write sets zero or more than one owner field |
| `REFERENCED_BY_OTHER_RECORDS` | 409 | Attempted archive/status-change blocked because another record still depends on this one (e.g. an Organization referenced by a Published Award) |
| `RATE_LIMITED` | 429 | Too many requests (Package 11/Security Hardening's concern; surfaced here for completeness) |
| `PROVIDER_UNAVAILABLE` | 502 | An upstream provider (OpenAI) failed or timed out |
| `CONFLICT` | 409 | Generic conflict not covered by a more specific code above |
| `INTERNAL_ERROR` | 500 | Unexpected server error; always logged server-side, never detailed to the client |

## Rule

Every endpoint documented in this specification lists only the error codes actually reachable by that endpoint (not this entire table) — see each package document's per-endpoint "Error Responses" field.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification (per-package §19 Error Handling sections)
