# Master Index

Complete index of every document and major artifact in AHR-Platform. For folder-level explanations, see `PROJECT_STRUCTURE.md`. For how this index and repository were assembled — including a verification pass that upgraded 36 stale documents and added 4 previously-missing foundational document sets — see `CONSOLIDATION_REPORT.md`.

## Code

| Area | Location | Detail |
|---|---|---|
| Web application | `apps/web/` | Public site + Administrator dashboard |
| Packages | `packages/*` | 12 packages: ai, auth, cms-core, config, content, database, media, notifications, relationships, search, site, workflow |
| Database migrations | `packages/database/migrations/` | 22 migrations, 24 tables (added `ai_recommendation_log`, `notification`, `organization_category`, `organization_tag`, 2026-07-21 — see `docs/Program-Status/Decision-Log.md` E3/E4/E5) |
| CI | `.github/workflows/` | Lint, typecheck, test, build, plus both SQL behavioral test suites |

## Content

| Area | Location |
|---|---|
| Real content dataset (people, works, projects, orgs, events, awards, media, press, categories, tags) | `content/Master-Content-Dataset/` |
| Import templates | `content/Import-Templates/` |
| Import pipeline & validator | `content/Import-Pipeline/` |
| Legacy source files (nine itemized, genuinely unresolved conflicts — see note) | `content/Master-Content-Dataset/12-Source-Files/` |

## Documentation (244 files across 10 categories)

# Master Index
Every document in `docs/`, grouped exactly as the folders are on disk. Paths are relative to the repository root.

## Architecture

**(root)**
- `docs/Architecture/As-Built-Architecture.md`

**Brand/Governance**
- `docs/Architecture/Brand/Governance/00-README.md`
- `docs/Architecture/Brand/Governance/08-governance.md`
- `docs/Architecture/Brand/Governance/09 - Brand Governance.md`
- `docs/Architecture/Brand/Governance/Documentation Workflow.md`
- `docs/Architecture/Brand/Governance/Project Rules.md`

**Decision-Records**
- `docs/Architecture/Decision-Records/0001-monorepo-vs-polyrepo.md`

**Foundational**
- `docs/Architecture/Foundational/00-INDEX.md`
- `docs/Architecture/Foundational/00-Knowledge-Foundation-Overview.md`
- `docs/Architecture/Foundational/01 - What is AHR.md`
- `docs/Architecture/Foundational/02 - Vision.md`
- `docs/Architecture/Foundational/03 - Mission.md`
- `docs/Architecture/Foundational/04 - Core Principles.md`
- `docs/Architecture/Foundational/05 - Platform Philosophy.md`
- `docs/Architecture/Foundational/06 - Ecosystem.md`
- `docs/Architecture/Foundational/07 - Products.md`
- `docs/Architecture/Foundational/08 - Users.md`
- `docs/Architecture/Foundational/09 - High-Level Architecture.md`
- `docs/Architecture/Foundational/09-knowledge-architecture.md`
- `docs/Architecture/Foundational/10 - Success Definition.md`
- `docs/Architecture/Foundational/10-roadmap-alignment.md`
- `docs/Architecture/Foundational/Audit Report.md`
- `docs/Architecture/Foundational/Existing Assets Inventory.md`
- `docs/Architecture/Foundational/Official Roadmap.md`
- `docs/Architecture/Foundational/Platform Components.md`
- `docs/Architecture/Foundational/Project Definition.md`
- `docs/Architecture/Foundational/Vision Statement.md`

**Information-Architecture**
- `docs/Architecture/Information-Architecture/01 - Information Architecture.md`
- `docs/Architecture/Information-Architecture/02 - Sitemap.md`
- `docs/Architecture/Information-Architecture/03 - Navigation System.md`
- `docs/Architecture/Information-Architecture/04 - User Journeys.md`
- `docs/Architecture/Information-Architecture/05 - Content Architecture.md`
- `docs/Architecture/Information-Architecture/06 - Content Taxonomy.md`
- `docs/Architecture/Information-Architecture/07 - URL Structure.md`
- `docs/Architecture/Information-Architecture/08 - Search Architecture.md`
- `docs/Architecture/Information-Architecture/09 - Dashboard Structure.md`
- `docs/Architecture/Information-Architecture/10 - Information Governance.md`

**Technical-Architecture-Principles**
- `docs/Architecture/Technical-Architecture-Principles/01 - Technical Architecture Principles.md`
- `docs/Architecture/Technical-Architecture-Principles/02 - System Architecture.md`
- `docs/Architecture/Technical-Architecture-Principles/03 - Service Architecture.md`
- `docs/Architecture/Technical-Architecture-Principles/04 - Integration Architecture.md`
- `docs/Architecture/Technical-Architecture-Principles/05 - Identity and Access Architecture.md`
- `docs/Architecture/Technical-Architecture-Principles/06 - AI Runtime Architecture.md`
- `docs/Architecture/Technical-Architecture-Principles/07 - Security Architecture.md`
- `docs/Architecture/Technical-Architecture-Principles/08 - Scalability and Performance Architecture.md`
- `docs/Architecture/Technical-Architecture-Principles/09 - Observability and Operational Architecture.md`
- `docs/Architecture/Technical-Architecture-Principles/10 - Future Technical Evolution.md`

## Business

**Business-Bible**
- `docs/Business/Business-Bible/00-README.md`
- `docs/Business/Business-Bible/01-business-bible.md`

**Business-Rules**
- `docs/Business/Business-Rules/00-README.md`
- `docs/Business/Business-Rules/02 - Business Processes.md`
- `docs/Business/Business-Rules/03 - Entity Lifecycles and State Transitions.md`
- `docs/Business/Business-Rules/03-business-rules.md`
- `docs/Business/Business-Rules/04 - Publication Rules.md`
- `docs/Business/Business-Rules/05 - Verification Logic.md`
- `docs/Business/Business-Rules/06 - Moderation Logic.md`
- `docs/Business/Business-Rules/07 - Ownership Rules.md`
- `docs/Business/Business-Rules/08 - Collaboration Logic.md`
- `docs/Business/Business-Rules/09 - Platform Policies and Exception Handling.md`
- `docs/Business/Business-Rules/10 - Future Business Services Mapping.md`
- `docs/Business/Business-Rules/Phase06-01-Business-Rules.md`

**CMS-Rules**
- `docs/Business/CMS-Rules/00-README.md`
- `docs/Business/CMS-Rules/03 - CMS API.md`
- `docs/Business/CMS-Rules/07 - CMS UI.md`
- `docs/Business/CMS-Rules/CTO-Deliverable-05-CMS.md`
- `docs/Business/CMS-Rules/Package 02 - CMS.md`

**Entity-Specifications**
- `docs/Business/Entity-Specifications/00-README.md`
- `docs/Business/Entity-Specifications/01-Person.md`
- `docs/Business/Entity-Specifications/02-Organization.md`
- `docs/Business/Entity-Specifications/03-Work.md`
- `docs/Business/Entity-Specifications/04-Project.md`
- `docs/Business/Entity-Specifications/05-Event.md`
- `docs/Business/Entity-Specifications/06-Contribution.md`
- `docs/Business/Entity-Specifications/07-Award.md`
- `docs/Business/Entity-Specifications/08-Media.md`
- `docs/Business/Entity-Specifications/09-Press-Mention.md`
- `docs/Business/Entity-Specifications/10-Category.md`
- `docs/Business/Entity-Specifications/11-Tag.md`

**Naming-Convention**
- `docs/Business/Naming-Convention/00-README.md`
- `docs/Business/Naming-Convention/01 - Brand Architecture.md`
- `docs/Business/Naming-Convention/02 - Brand Hierarchy.md`
- `docs/Business/Naming-Convention/03 - Brand Roles.md`
- `docs/Business/Naming-Convention/04 - Naming System.md`

## Knowledge

**AI-Knowledge**
- `docs/Knowledge/AI-Knowledge/00-README.md`
- `docs/Knowledge/AI-Knowledge/01 - AI Principles.md`
- `docs/Knowledge/AI-Knowledge/02 - AI Role and Boundaries.md`
- `docs/Knowledge/AI-Knowledge/03 - AI Interaction Architecture.md`
- `docs/Knowledge/AI-Knowledge/04 - AI Decision Boundaries.md`
- `docs/Knowledge/AI-Knowledge/05 - AI Data Access Model.md`
- `docs/Knowledge/AI-Knowledge/06 - AI Recommendation Model.md`
- `docs/Knowledge/AI-Knowledge/07 - AI API.md`
- `docs/Knowledge/AI-Knowledge/07 - AI Explainability.md`
- `docs/Knowledge/AI-Knowledge/08 - AI Confidence Model.md`
- `docs/Knowledge/AI-Knowledge/09 - Human-in-the-Loop Architecture.md`
- `docs/Knowledge/AI-Knowledge/10 - Future AI Services Mapping.md`
- `docs/Knowledge/AI-Knowledge/11 - AI UI.md`
- `docs/Knowledge/AI-Knowledge/CTO-Deliverable-14-AI-Integration.md`
- `docs/Knowledge/AI-Knowledge/Package 06 - AI.md`
- `docs/Knowledge/AI-Knowledge/README.md`

**Standards**
- `docs/Knowledge/Standards/00-README.md`
- `docs/Knowledge/Standards/05-design-principles.md`
- `docs/Knowledge/Standards/06-content-standards.md`
- `docs/Knowledge/Standards/07-editorial-guidelines.md`

**Terminology**
- `docs/Knowledge/Terminology/00-README.md`
- `docs/Knowledge/Terminology/04-terminology-dictionary.md`

## Experience

**(root)**
- `docs/Experience/Backlog.md`
- `docs/Experience/Design Status Report.md`
- `docs/Experience/README.md`

**Accessibility Guidelines**
- `docs/Experience/Accessibility Guidelines/README.md`

**Brand Identity**
- `docs/Experience/Brand Identity/README.md`

**Color System**
- `docs/Experience/Color System/README.md`

**Components Library**
- `docs/Experience/Components Library/README.md`

**Dashboard Designs**
- `docs/Experience/Dashboard Designs/README.md`

**Design Principles**
- `docs/Experience/Design Principles/README.md`

**Design System**
- `docs/Experience/Design System/README.md`

**Design Tokens**
- `docs/Experience/Design Tokens/README.md`

**High-Fidelity Designs**
- `docs/Experience/High-Fidelity Designs/README.md`

**Icons & Assets**
- `docs/Experience/Icons & Assets/README.md`

**Information Architecture**
- `docs/Experience/Information Architecture/README.md`

**Interaction & Motion Guidelines**
- `docs/Experience/Interaction & Motion Guidelines/README.md`

**Mobile Designs**
- `docs/Experience/Mobile Designs/README.md`

**Personas**
- `docs/Experience/Personas/README.md`

**Prototype**
- `docs/Experience/Prototype/README.md`

**Responsive Designs**
- `docs/Experience/Responsive Designs/README.md`

**Typography**
- `docs/Experience/Typography/README.md`

**UI Kit**
- `docs/Experience/UI Kit/README.md`

**UX Research**
- `docs/Experience/UX Research/README.md`

**UX-Architecture**
- `docs/Experience/UX-Architecture/01 - UX Principles.md`
- `docs/Experience/UX-Architecture/02 - Navigation Architecture.md`
- `docs/Experience/UX-Architecture/03 - Information Presentation.md`
- `docs/Experience/UX-Architecture/04 - User Journeys.md`
- `docs/Experience/UX-Architecture/05 - Entry Points.md`
- `docs/Experience/UX-Architecture/06 - Interaction Patterns.md`
- `docs/Experience/UX-Architecture/07 - Search and Discovery Experience.md`
- `docs/Experience/UX-Architecture/08 - Notification Experience.md`
- `docs/Experience/UX-Architecture/09 - Content Consumption Experience.md`
- `docs/Experience/UX-Architecture/10 - Design System Foundations.md`

**User Flows**
- `docs/Experience/User Flows/README.md`

**User Journeys**
- `docs/Experience/User Journeys/README.md`

**Website Designs**
- `docs/Experience/Website Designs/README.md`

**Wireframes**
- `docs/Experience/Wireframes/AI.md`
- `docs/Experience/Wireframes/Archive.md`
- `docs/Experience/Wireframes/Authentication.md`
- `docs/Experience/Wireframes/CMS.md`
- `docs/Experience/Wireframes/Contacts-Organizations.md`
- `docs/Experience/Wireframes/Media-Library.md`
- `docs/Experience/Wireframes/Notifications.md`
- `docs/Experience/Wireframes/README.md`
- `docs/Experience/Wireframes/Search.md`

## Database

**(root)**
- `docs/Database/Data-Foundation-Conventions.md`
- `docs/Database/Database-Architecture-Overview.md`

**Domain-Model**
- `docs/Database/Domain-Model/00-README.md`
- `docs/Database/Domain-Model/01 - Data Architecture.md`
- `docs/Database/Domain-Model/02 - Entity Catalog.md`
- `docs/Database/Domain-Model/02-domain-model.md`
- `docs/Database/Domain-Model/03 - Relationship Model.md`
- `docs/Database/Domain-Model/04 - Identity Model.md`
- `docs/Database/Domain-Model/05 - Data Lifecycle.md`
- `docs/Database/Domain-Model/06 - Data Integrity Rules.md`
- `docs/Database/Domain-Model/07 - Archive Model.md`
- `docs/Database/Domain-Model/08 - Metadata Model.md`
- `docs/Database/Domain-Model/09 - Identifier Strategy.md`
- `docs/Database/Domain-Model/10 - Future Database Mapping.md`

## API

**(root)**
- `docs/API/API-Architecture-Notes.md`

**API-Specification**
- `docs/API/API-Specification/01 - API Standards.md`
- `docs/API/API-Specification/02 - Authentication API.md`
- `docs/API/API-Specification/03 - CMS API.md`
- `docs/API/API-Specification/04 - Website API.md`
- `docs/API/API-Specification/05 - Archive API.md`
- `docs/API/API-Specification/06 - Contacts & Organizations API.md`
- `docs/API/API-Specification/07 - AI API.md`
- `docs/API/API-Specification/08 - Dashboard API.md`
- `docs/API/API-Specification/09 - Media Library API.md`
- `docs/API/API-Specification/10 - Search API.md`
- `docs/API/API-Specification/11 - Notifications API.md`
- `docs/API/API-Specification/12 - Error Codes.md`
- `docs/API/API-Specification/13 - Authentication Rules.md`
- `docs/API/API-Specification/14 - Permissions Matrix.md`
- `docs/API/API-Specification/15 - API Conventions.md`
- `docs/API/API-Specification/README.md`

## Deployment

**(root)**
- `docs/Deployment/Branching-Strategy.md`
- `docs/Deployment/Deployment-Guide.md`
- `docs/Deployment/Deployment-and-DevOps-Architecture.md`
- `docs/Deployment/Performance-Architecture.md`
- `docs/Deployment/Production-Readiness-Checklist.md`
- `docs/Deployment/Production-Readiness-Report.md`
- `docs/Deployment/QA-Report.md`
- `docs/Deployment/Release-Checklist.md`
- `docs/Deployment/Rollback-Plan.md`
- `docs/Deployment/Security-Architecture.md`
- `docs/Deployment/Testing-Architecture.md`

## Guides

**(root)**
- `docs/Guides/Administrator-Handbook.md`
- `docs/Guides/Authentication-and-Authorization.md`
- `docs/Guides/Coding-Standards.md`
- `docs/Guides/Visitor-Guide.md`

## Development

**(root)**
- `docs/Development/AI-Integration-Architecture.md`
- `docs/Development/AI-Integration-Implementation-Note.md`
- `docs/Development/Backend-Architecture.md`
- `docs/Development/Backlog.md`
- `docs/Development/Build-Manifest.md`
- `docs/Development/CMS-Architecture.md`
- `docs/Development/Dashboard-Architecture.md`
- `docs/Development/Development-README.md`
- `docs/Development/Development-Status.md`
- `docs/Development/Frontend-Architecture.md`
- `docs/Development/Integrations-Architecture.md`
- `docs/Development/Phase-1-Implementation-Audit-Report.md`

**Delivery-Planning**
- `docs/Development/Delivery-Planning/01 - Implementation Principles.md`
- `docs/Development/Delivery-Planning/02 - Solution Decomposition.md`
- `docs/Development/Delivery-Planning/03 - Development Boundaries.md`
- `docs/Development/Delivery-Planning/04 - Environment Strategy.md`
- `docs/Development/Delivery-Planning/05 - Testing Architecture.md`
- `docs/Development/Delivery-Planning/06 - Release and Deployment Strategy.md`
- `docs/Development/Delivery-Planning/07 - Migration Strategy.md`
- `docs/Development/Delivery-Planning/08 - Operational Readiness.md`
- `docs/Development/Delivery-Planning/09 - Delivery Governance.md`
- `docs/Development/Delivery-Planning/10 - Future Evolution Strategy.md`

## Program-Status

**(root)**
- `docs/Program-Status/Completion-Report.md`
- `docs/Program-Status/Decision-Log.md`
- `docs/Program-Status/Gap-Analysis-and-Remaining-Work.md`
- `docs/Program-Status/Integration-Report.md`
- `docs/Program-Status/Product-Manifest.md`
- `docs/Program-Status/Release-Notes.md`
- `docs/Program-Status/Roadmap.md`
- `docs/Program-Status/Status-Report.md`
- `docs/Program-Status/Validation-Report.md`
- `docs/Program-Status/Version-Manifest.md`

**CTO-Reviews/Phase-2-Milestones-1-7**
- `docs/Program-Status/CTO-Reviews/Phase-2-Milestones-1-7/01-Technical-Audit-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-2-Milestones-1-7/02-Milestone-01-Bootstrap-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-2-Milestones-1-7/03-Milestone-02-Database-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-2-Milestones-1-7/04-Milestone-03-Authentication-Authorization-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-2-Milestones-1-7/05-Milestone-04-CMS-Foundation-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-2-Milestones-1-7/06-Milestone-05-Content-Domain-Packages-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-2-Milestones-1-7/07-Milestone-06-Media-Library-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-2-Milestones-1-7/08-Milestone-07-Relationships-Metadata-Verification-Report.md`

**CTO-Reviews/Phase-3-Milestones-8-16-and-Approval**
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/01-Milestone-08-Public-Website-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/02-Milestone-09-Search-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/03-Milestone-Admin-Dashboard-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/04-Milestone-11-Notifications-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/05-Milestone-AI-Integration-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/06-Remaining-Services-Platform-Features-Verification-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/07-Security-and-Performance-Review-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/08-Testing-and-QA-Review-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/09-Deployment-and-Production-Readiness-Review-Report.md`
- `docs/Program-Status/CTO-Reviews/Phase-3-Milestones-8-16-and-Approval/10-CTO-Approval-Report.md`

## Archive (historical reference only — not authoritative)

See `Archive/` on disk and "What Was Archived" in `CONSOLIDATION_REPORT.md`.
