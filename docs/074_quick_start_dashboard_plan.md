# 074 — Quick Start Section on Dashboard

## Goal
Add a prominent "Quick Start" section on the home dashboard (Home.tsx) that guides lawyers through the workflow of:
1. Uploading documents → Creating a case → Using AI workflows

## Understanding the Flow
The current flow is:
- Lawyer goes to `/documents` → uploads OCR files → AI generates case data → creates a case
- Then goes to `/cases/:id/document-selection` → picks a workflow (defense memo, claim statement, etc.)
- This flow is NOT obvious to new users from the dashboard

## Design Plan
Add a visually stunning "Quick Start" card section ABOVE the existing grid (below stats cards).
It will have 3 steps shown as a guided timeline/wizard:

### Step 1: Upload Documents
- Icon: Upload
- Text: "ارفع مستندات القضية"
- Subtitle: "صور أو PDF — سنحولها لقضية ذكية"
- Links to `/documents`

### Step 2: Create a Case
- Icon: Briefcase
- Text: "أنشئ القضية"
- Subtitle: "أضف تفاصيل القضية والوقائع"
- Links to `/documents` (same flow, creates case from OCR)

### Step 3: Start AI Workflows
- Icon: AI/Sparkles
- Text: "ابدأ العمل بالذكاء الاصطناعي"
- Subtitle: "مذكرة دفاع، صحيفة دعوى، طعن..."
- Links to `/cases` (pick existing case)

## Technical Changes
- **Home.tsx**: Add `QuickStartSection` component between stats and the grid
- **Home.css**: Add styles for the quick start section
- No backend changes needed
- No new API calls needed

## Status: ✅ Completed
