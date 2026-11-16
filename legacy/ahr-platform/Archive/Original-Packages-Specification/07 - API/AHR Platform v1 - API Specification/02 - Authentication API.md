# AHR Platform v1 — Authentication API

**Status:** 🔒 Frozen

Base path: `/api/auth`

---

### Login

- **Purpose:** Authenticate the Administrator and establish a session.
- **Package:** Authentication
- **HTTP Method:** POST
- **Route:** `/api/auth/login`
- **Authentication Required:** No
- **Required Role:** None (public)
- **Request Headers:** `Content-Type: application/json`
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** `{ "email": string, "password": string }`
- **Validation Rules:** `email` syntactically valid; `password` non-empty. No password strength rule enforced client-side (Supabase Auth's own policy applies).
- **Success Response:** `200 { "data": { "sessionEstablished": true } }` — the session itself is set via a cookie, not returned in the body.
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED` (wrong credentials — generic message, per Packages Specification Package 01 §19); `500 INTERNAL_ERROR` (provider outage).
- **Business Rules:** Every successful login writes one `activity_log` row (`action='login'`).
- **Notes:** Never reveal whether the email exists.

---

### Logout

- **Purpose:** Terminate the current session.
- **Package:** Authentication
- **HTTP Method:** POST
- **Route:** `/api/auth/logout`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": { "signedOut": true } }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED` if already signed out (idempotent no-op, not an error in practice, but documented for completeness).
- **Business Rules:** Writes one `activity_log` row (`action='logout'`).
- **Notes:** Clears the Supabase session cookie.

---

### Refresh Token

- **Purpose:** Extend the current session without requiring re-authentication.
- **Package:** Authentication
- **HTTP Method:** POST
- **Route:** `/api/auth/refresh-token`
- **Authentication Required:** Yes (a valid, not-yet-fully-expired session/refresh token)
- **Required Role:** Administrator
- **Request Headers:** Session cookie (containing the refresh token, per Supabase Auth's own cookie handling)
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": { "sessionExtended": true, "expiresAt": "<ISO 8601>" } }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED` if the refresh token itself has expired — the client must fall back to a full Login.
- **Business Rules:** None beyond standard session handling.
- **Notes:** This is a thin wrapper over Supabase Auth's own refresh mechanism (Authentication Rules, doc 13) — the platform does not implement its own token issuance.

---

### Forgot Password

- **Purpose:** Initiate a password reset.
- **Package:** Authentication
- **HTTP Method:** POST
- **Route:** `/api/auth/forgot-password`
- **Authentication Required:** No
- **Required Role:** None (public)
- **Request Headers:** `Content-Type: application/json`
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** `{ "email": string }`
- **Validation Rules:** Syntactically valid email.
- **Success Response:** `200 { "data": { "requested": true } }` — always this response, regardless of whether the email matches an account.
- **Error Responses / HTTP Status Codes:** `422 VALIDATION_ERROR` (malformed email only); never a "not found" for the email itself.
- **Business Rules:** No enumeration of valid accounts (Packages Specification Package 01 §15).
- **Notes:** Actual reset email delivery is Supabase Auth's mechanism.

---

### Reset Password

- **Purpose:** Complete a password reset using the token from the reset email.
- **Package:** Authentication
- **HTTP Method:** POST
- **Route:** `/api/auth/reset-password`
- **Authentication Required:** No (authenticated by the reset token itself, not a session)
- **Required Role:** None
- **Request Headers:** `Content-Type: application/json`
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** `{ "resetToken": string, "newPassword": string }`
- **Validation Rules:** Token must be valid/unexpired (Supabase-issued); password meets Supabase Auth's policy.
- **Success Response:** `200 { "data": { "passwordUpdated": true } }`
- **Error Responses / HTTP Status Codes:** `422 VALIDATION_ERROR` (invalid/expired token, or password policy failure).
- **Business Rules:** None additional.
- **Notes:** None.

---

### Profile — Read Only (flagged gap)

- **Purpose:** Return the minimal identity information currently available for the signed-in Administrator.
- **Package:** Authentication
- **HTTP Method:** GET
- **Route:** `/api/auth/profile`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": { "personId": uuid, "nameAr": string, "nameEn": string, "role": "administrator" } }` — sourced from `person` + `platform_user`, read-only.
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED`.
- **Business Rules:** None.
- **Notes:** **There is no corresponding write/edit endpoint.** UI/UX Specification (User Flows, doc 05, §11) flagged that no Profile Management screen or editable-profile data model exists anywhere in the frozen Packages Specification or Database Architecture. This endpoint exposes only what already exists for display purposes (e.g. showing the signed-in Administrator's name in the Dashboard Top Bar) — it is not a partial implementation of profile editing, and no `PATCH` variant is specified here because there is nothing approved for it to write to beyond the `person` fields CMS (03 - CMS API) already manages.

---

### Permissions

- **Purpose:** Return the current session's resolved role and its high-level capabilities, for UI purposes.
- **Package:** Authentication
- **HTTP Method:** GET
- **Route:** `/api/auth/permissions`
- **Authentication Required:** Yes
- **Required Role:** Administrator
- **Request Headers:** Session cookie
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": { "role": "administrator", "capabilities": ["content:write", "moderation:manage", "settings:manage", ...] } }`
- **Error Responses / HTTP Status Codes:** `401 UNAUTHENTICATED`.
- **Business Rules:** This endpoint is informational only — it does not itself grant access; every other endpoint independently checks the role server-side (Authentication Rules, doc 13).
- **Notes:** In V1, the capability list is always the same (single role) — it exists mainly so the frontend has one place to ask "what can I do," ready for Release 2 when this becomes meaningfully different per session.

---

### Role Validation

**No standalone endpoint.** Role validation is a cross-cutting, per-request server-side check performed identically by every protected endpoint's own middleware — see Authentication Rules (doc 13). Documenting it as an endpoint here would misrepresent it as something a client calls in isolation, which it is not.

---

### Session Management (Session Check)

- **Purpose:** Let the client check whether its current session is still valid, without triggering a refresh.
- **Package:** Authentication
- **HTTP Method:** GET
- **Route:** `/api/auth/session`
- **Authentication Required:** No (this endpoint's entire purpose is to answer "am I authenticated," so it doesn't itself require a prior-confirmed session)
- **Required Role:** None
- **Request Headers:** Session cookie, if present
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Validation Rules:** None
- **Success Response:** `200 { "data": { "authenticated": true, "role": "administrator" } }` or `200 { "data": { "authenticated": false } }` — this endpoint never returns a 401; "not authenticated" is a normal, successful answer to the question it's asking.
- **Error Responses / HTTP Status Codes:** `500 INTERNAL_ERROR` only, for genuine backend failure.
- **Business Rules:** None.
- **Notes:** Used by `AuthGuard` (Packages Specification Package 01 §9) to decide whether to redirect to `/login`.

---

**Status:** 🔒 Frozen
**Reviewed By:** Claude
**Approved By:** Pending
**Dependencies:** Packages Specification Package 01, Database Architecture (Frozen v1) §6–§7, Authentication Rules (doc 13)
