# Quickstart: Page AI Guidance

## Scenario 1: Main Pages Explain Their Purpose

1. Start the lawyer dashboard.
2. Open the dashboard home page.
3. Confirm the page opens an Arabic guidance popup explaining the page purpose, ordered steps, and next recommended action.
4. Repeat for cases, clients, documents, contracts, legal library, agenda, chat, settings, subscription, and process-server papers pages.

## Scenario 2: AI-Capable Pages Explain AI Use

1. Open a case details page.
2. Confirm guidance explains when to start smart analysis and what case facts or documents should be ready.
3. Open document selection and legal workflow pages.
4. Confirm guidance explains AI prerequisites, expected output, and lawyer review responsibility.
5. Open the AI chat page.
6. Confirm guidance explains when to ask the assistant and how to provide enough context.

## Scenario 3: Non-AI Pages Avoid Misleading AI Prompts

1. Open settings and subscription pages.
2. Confirm they explain the manual page workflow.
3. Confirm they do not imply there is an AI action on those pages.

## Scenario 4: Repeat Use

1. Expand guidance on a page and review details.
2. Collapse guidance.
3. Refresh the page.
4. Confirm the popup does not appear again for that page in the same browser.
5. Confirm other pages still show their own guidance popups until dismissed separately.

## Validation Commands

```bash
cd "/Users/mazenelsbagh/mazen mac/apps/mohamy smart/apps/lawyer-dashboard"
npm run lint
npm run build
```

Known repository state may include unrelated type errors in existing pages. If build fails outside guidance files, record the unrelated failures and validate guidance with lint and focused manual review.
