# Research: Mobile Web Parity

## Decision: Build mobile parity as incremental workflow slices, not a desktop clone

**Rationale**: The mobile product must cover the same lawyer outcomes as the web dashboard, but phone workflows need bottom actions, progressive disclosure, card/list layouts, and clear state transitions. Copying desktop tables and multi-panel layouts would violate the product requirement for a modern Arabic mobile app.

**Alternatives considered**:
- Pixel-level web duplication: rejected because it would produce cramped mobile screens and poor touch ergonomics.
- Fully separate mobile product scope: rejected because the user explicitly requested web flow parity.

## Decision: Keep backend as the source of truth and remove silent production fake data

**Rationale**: The constitution requires API-first integration. Existing mobile screens already call a subset of backend endpoints; parity work should expand that boundary and show explicit unavailable/error states where backend coverage is missing.

**Alternatives considered**:
- Continue demo repository behavior for missing sections: rejected for production-facing flows because it hides real gaps.
- Build a separate mobile backend: rejected because the current product already has a web/backend API surface.

## Decision: Stabilize current `AppState` before progressively extracting feature controllers

**Rationale**: The app currently routes many screens through one `AppState`. A full rewrite would collide with existing user changes and slow delivery. The first slice should add typed data models, API coverage, and clearer state records, then future slices can extract per-feature controllers.

**Alternatives considered**:
- Immediate full architecture rewrite: rejected because of high blast radius.
- Leave `AppState` unchanged: rejected because it is already responsible for too many unrelated workflows.

## Decision: Prioritize Auth, Case Workspace, Documents/OCR, and AI Workflows

**Rationale**: These flows unlock the primary daily lawyer experience and match the gap report's P0 findings. Contracts, process-server papers, notifications, and advanced settings remain necessary for parity but can be completed after the foundation is safe.

**Alternatives considered**:
- Start with all navigation destinations visually: rejected because it would spread effort thin and leave critical flows shallow.
- Start with visual polish only: rejected because missing backend-backed behavior is the bigger gap.

## Decision: Treat AI workflows as web-parity workflows with mobile-specific step UI

**Rationale**: The web dashboard has seven legal workflow families and specific step definitions. Mobile should reuse workflow type names, step order, point confirmation, snapshots, and SignalR status, but present them with mobile-appropriate review and bottom actions.

**Alternatives considered**:
- One generic runner for every workflow forever: rejected because it hides workflow-specific legal review needs.
- Seven completely isolated implementations: rejected because it would duplicate state, point handling, snapshots, and job status behavior.

## Decision: Use restrained premium product styling

**Rationale**: Product design context requires refined, elegant, precise UI: Arabic-first, Tajawal, warm neutrals, restrained amber accents, light/dark parity, and no decorative clutter. The mobile interface should feel native and task-focused.

**Alternatives considered**:
- Dramatic legal-themed visuals: rejected as generic and distracting.
- Dense desktop-like forms: rejected because phone ergonomics require progressive grouping and sticky actions.

## Decision: Validate with Flutter analyzer/tests and targeted manual scenarios

**Rationale**: The existing mobile project already has Flutter tests. Parity changes should keep automated coverage focused on routing, form validation, state transitions, and AI/document edge states.

**Alternatives considered**:
- Manual QA only: rejected because auth, workflow, and OCR states are regression-prone.
- Full end-to-end device automation in this slice: deferred because backend/dev server availability may vary locally.

