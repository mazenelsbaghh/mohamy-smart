---
description: "Task list template for feature implementation"
---

# Tasks: Phase 2 — Input and File Validation Security

**Input**: Design documents from `/specs/052-phase2-input-security/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Add `clamav` Docker service to `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/docker-compose.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

*(No blocking tasks identified outside of specific user stories)*

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Malicious File Upload Blocked (Priority: P1)

**Goal**: Reject unauthorized file extensions, sizes, and malicious payloads.

**Independent Test**: Upload an invalid extension or large file and verify rejection. Upload an EICAR test file and verify ClamAV rejection.

### Implementation for User Story 1

- [x] T002 [US1] Create `MaxFileSizeAttribute` validation class in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Attributes/MaxFileSizeAttribute.cs`
- [x] T003 [US1] Create `AllowedExtensionsAttribute` validation class in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Attributes/AllowedExtensionsAttribute.cs`
- [x] T004 [US1] Implement `VirusScannerService` using nClam in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer.Application/Services/VirusScannerService.cs`
- [x] T005 [US1] Register `VirusScannerService` in DI container in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`

---

## Phase 4: User Story 2 - XSS Prevention on Rich Text Rendering (Priority: P1)

**Goal**: Sanitize frontend dynamic HTML content.

**Independent Test**: Render `<script>alert(1)</script>` in the frontend and ensure it doesn't execute.

### Implementation for User Story 2

- [x] T006 [P] [US2] Install `dompurify` and `@types/dompurify` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/package.json`
- [x] T007 [US2] Create `SafeHtmlRenderer` component in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-lawyer-dashboard/src/components/ui/SafeHtmlRenderer.tsx`
- [x] T008 [P] [US2] Install `dompurify` and `@types/dompurify` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/package.json`
- [x] T009 [US2] Create `SafeHtmlRenderer` component in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-admin-dashboard/src/components/ui/SafeHtmlRenderer.tsx`

---

## Phase 5: User Story 3 - AI Endpoint Resource Protection (Priority: P1)

**Goal**: Rate-limit AI and OCR processing endpoints.

**Independent Test**: Hit the AI endpoint 10 times quickly and observe a 429 Too Many Requests response.

### Implementation for User Story 3

- [x] T010 [US3] Configure .NET 9 Rate Limiting middleware and policies in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`
- [x] T011 [US3] Apply `[EnableRateLimiting("AiEndpoints")]` to AI Controllers in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Controllers/`

---

## Phase 6: User Story 4 - Unauthorized Internal Dashboard Access (Priority: P1)

**Goal**: Secure Hangfire dashboard.

**Independent Test**: Access `/hangfire` without an Admin JWT and receive 401 Unauthorized. Access with Admin JWT and receive 200 OK.

### Implementation for User Story 4

- [x] T012 [US4] Implement `HangfireAuthorizationFilter` in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Filters/HangfireAuthorizationFilter.cs`
- [x] T013 [US4] Configure Hangfire Dashboard options to use the custom filter in `/Users/mazenelsbagh/mazen mac/apps/mohamy smart/mohamy-smart-backend/Lawyer/Program.cs`

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T014 Verify `make dev` starts the new ClamAV container alongside existing services

---

## Dependencies & Execution Order

### Phase Dependencies
- Setup (Phase 1): Can start immediately
- User Stories (Phases 3-6): Can start after Phase 1

### Parallel Opportunities
- US1 (Backend), US2 (Frontend), US3 (Backend), and US4 (Backend) can be implemented in parallel.
- Within US2, the Lawyer and Admin dashboard updates can be done in parallel.

### Implementation Strategy
1. Add ClamAV to docker-compose (T001)
2. Backend Security (T002 - T005, T010 - T013)
3. Frontend Security (T006 - T009)
4. Validate execution (T014)
