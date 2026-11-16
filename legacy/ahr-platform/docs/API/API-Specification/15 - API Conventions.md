# AHR Platform v1 — API Conventions

**Status:** 🔒 Frozen

Supplementary to `01 - API Standards` — conventions that apply across endpoint documentation, not the wire format itself.

## Endpoint Documentation Template

Every endpoint in this specification is documented with exactly these 15 fields, in this order, per your instruction:

Endpoint Name, Purpose, Package, HTTP Method, Route, Authentication Required, Required Role, Request Headers, Path Parameters, Query Parameters, Request Body, Validation Rules, Success Response, Error Responses, HTTP Status Codes, Business Rules, Notes.

("Error Responses" and "HTTP Status Codes" are documented together as one combined field per endpoint, to avoid repeating the same code/status pairs twice — noted here once rather than re-explained in every package document.)

## Generic Entity Families

Several packages (CMS, Contacts & Organizations) operate on multiple structurally-similar entities (Person, Work, Project, Event, Award, Category, Tag / Organization). Rather than repeating an identical CRUD+transition endpoint group once per entity type — which would make this specification thousands of lines longer without adding information — each such package documents:

1. **One fully-specified generic endpoint family**, parameterized by an entity-type path segment.
2. **A table of entity-specific differences** (extra fields, extra validation) layered on top of the generic family.

This mirrors Package 04 (Archive)'s own "one shared function per concern, not one per entity" rule — applied here to API documentation itself, not just to the code it will eventually describe.

## Idempotency

`POST .../transition` and `POST /media` (upload) are not guaranteed idempotent in V1 — no idempotency-key mechanism is specified. Retrying a transition request that already succeeded will be rejected with `INVALID_STATUS_TRANSITION` (the entity is no longer in the "from" state the retry assumed), which is an acceptable, if not ideal, signal for now.

## Timestamps

All timestamps in requests/responses are ISO 8601, UTC (`timestamptz` at the database layer, per Database Architecture §5).

## Empty/Null Conventions

A field with no value is `null` in JSON, never an empty string standing in for "not set" — this matters most for nullable foreign keys (`organizationId` on a Project that has none) and nullable bilingual fields.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** 01 - API Standards
