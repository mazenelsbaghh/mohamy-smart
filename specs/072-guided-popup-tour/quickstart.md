# Quickstart: Guided Popup Tour

## Scenario 1: Button Tour Moves Through Page Controls

1. Start the lawyer dashboard.
2. Open a case workflow page such as `/cases/:id/document-selection/defense-memo`.
3. Confirm the popup appears above the full app shell.
4. Click `التالي`.
5. Confirm the step text changes and the spotlight moves to a relevant button or page area when present.
6. Click `السابق`.
7. Confirm the previous step returns.

## Scenario 2: AI Guidance Remains Professional

1. Open an AI-capable page such as case details, document selection, defense memo, documents, contracts, or chat.
2. Navigate the guided popup steps.
3. Confirm an AI step explains required inputs and expected output.
4. Confirm the lawyer review responsibility is explicit.

## Scenario 3: Missing Target Fallback

1. Open a page where some target buttons are disabled, absent, or hidden by state.
2. Navigate to the related guided step.
3. Confirm the popup still shows the explanation and does not crash.

## Scenario 4: Permanent Dismissal

1. Open any guided page.
2. Click `عدم الإظهار مرة أخرى`.
3. Refresh the same page.
4. Confirm the popup does not reappear for that page.
5. Navigate to another guided page and confirm that page can still show its own popup.

## Validation Commands

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard"
npm run lint
npm run build
```

Known repository state may include unrelated type errors in existing pages. If build fails outside guidance files, record the unrelated failures and validate the guided popup with lint and browser review.
