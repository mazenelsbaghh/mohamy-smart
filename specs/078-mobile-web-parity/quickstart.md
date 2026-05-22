# Quickstart: Mobile Web Parity

## Purpose

Validate that the Mohamy Smart mobile app now behaves like a real mobile companion to the lawyer web dashboard, not a static demo.

## Prerequisites

1. Backend available at the canonical local development port:

```sh
http://localhost:8976
```

2. Flutter dependencies installed for the mobile app.
3. A lawyer account with cases, clients, documents, agenda items, and AI point balance available in the backend.

## Run Mobile Checks

From repository root:

```sh
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/mohamy_smart_mobile"
flutter pub get
flutter analyze
flutter test
```

## Manual Validation Scenarios

### 1. Authentication and Session

1. Launch the app.
2. Complete onboarding if shown.
3. Sign in with a valid lawyer account.
4. Close and reopen the app.
5. Confirm the app restores the session or shows a clear re-authentication state.

Expected result: The lawyer reaches Home without seeing blank screens or losing session context unexpectedly.

### 2. Home and Navigation

1. Open Home.
2. Confirm AI points, urgent agenda, active cases, documents, and running/recent AI work are visible or have useful empty states.
3. Navigate to Cases, Clients, Agenda, and More.
4. Confirm all major lawyer web destinations are reachable directly or contextually.

Expected result: Mobile navigation covers the web dashboard's major lawyer destinations while keeping primary actions reachable.

### 3. Case Workspace

1. Open Cases.
2. Search/filter cases.
3. Create a case with required legal fields.
4. Open Case Details.
5. Confirm facts, documents, agenda, client, and AI actions are visible.

Expected result: The case workspace can support legal work without returning to web.

### 4. Documents and OCR

1. Open Documents or a case's Documents tab.
2. Upload or scan a document.
3. Inspect upload/processing/ready/failed states.
4. Review OCR output and create or update a case from confirmed fields.

Expected result: Document intake is transparent and recoverable.

### 5. AI Workflow

1. Open a case with facts and documents.
2. Open AI Workflow Hub.
3. Select defense memo or statement of claims.
4. Confirm readiness, selected facts/documents, point cost, and available balance.
5. Start a step, leave the screen, return, and resume.
6. Save, rename, restore, and delete a workflow version.
7. Copy/share/export final output when complete.

Expected result: AI workflow behavior matches the web flow's lifecycle and communicates point usage clearly.

### 6. Modern UI Review

1. Validate 390x844 and 430x932 phone sizes.
2. Switch light/dark mode.
3. Inspect long Arabic labels, mixed Arabic/English text, empty states, loading states, and error states.

Expected result: No overlap, no unreadable contrast, no cramped desktop-like screens, and no decorative UI that distracts from legal work.

## Validation Notes

- `dart format lib test` completed successfully.
- `flutter analyze` completed with no issues.
- `flutter test` completed with all tests passing.
- Added focused coverage for shared state views, notifications navigation, OCR-to-case prefilling, and AI workflow point readiness.
