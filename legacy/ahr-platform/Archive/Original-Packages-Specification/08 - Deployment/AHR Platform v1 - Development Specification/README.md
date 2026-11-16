# AHR Platform v1 — Development Specification

## Purpose

This is the primary handbook for every developer working on AHR Platform v1. It defines **how** the seven frozen documents (Vision, Build Manifest, Technology Stack, Database Architecture, Packages Specification, UI/UX Specification, API Specification) must be implemented — it does not redesign or reinterpret any of them.

## Document Index

| Doc | Content |
|---|---|
| 01 — Development Principles | 8 principles governing every engineering decision |
| 02 — Project Structure | Monorepo layout, package-to-business-package mapping |
| 03 — Folder Structure | `apps/web` and `packages/*` internal layout |
| 04 — Naming Conventions | Consolidated index of naming rules already frozen elsewhere |
| 05 — Coding Standards | Extends Milestone 1's coding standards across the full package set |
| 06 — Backend Development Rules | Route Handlers/Server Actions, validation, database access rules |
| 07 — Frontend Development Rules | Component sourcing, bilingual rendering, Design System usage |
| 08 — API Integration Rules | How the frontend consumes the frozen API contract |
| 09 — State Management Strategy | Server state vs. UI state; no heavy client store in V1 |
| 10 — Error Handling Strategy | Layered handling, single error vocabulary |
| 11 — Logging Strategy | Three distinct logs, kept separate |
| 12 — File Upload Rules | Owner-first uploads, storage path construction, versioning-safe replace |
| 13 — Caching Strategy | What may/must never be cached |
| 14 — Security Implementation Rules | Defense in depth, least privilege, secrets handling |
| 15 — Performance Guidelines | Read/write asymmetry, indexing, no premature optimization |
| 16 — Git Workflow | Day-to-day process |
| 17 — Branch Strategy | The branch model itself |
| 18 — Pull Request Rules | Required PR contents and merge gates |
| 19 — Code Review Checklist | What a reviewer verifies |
| 20 — Definition of Done | Architecture/Database/API/UI/Security/Performance/Accessibility/Testing/Documentation gates |
| 21 — Acceptance Criteria | Format and minimum coverage standard |
| 22 — Development Checklist | The official pre-code, pre-PR, pre-merge, pre-promotion checklist |

## What This Document Does Not Do

Per your instructions: it does not invent features, modify architecture, or redesign packages. Every rule here either restates something already frozen (naming, branch strategy) or derives directly and narrowly from it (how validation layers relate, how errors map to codes).

## Relationship to Milestone 1/2 Documents

`docs/coding-standards.md` and `docs/branching-strategy.md` (Milestone 1) remain valid and are not superseded — this specification extends them to the full, now-larger scope (10 packages, not just the initial project skeleton) rather than replacing them.

---

**Status:**
🔒 Frozen

**Prepared By:**
Claude

**Approved By:**
Architecture Review
