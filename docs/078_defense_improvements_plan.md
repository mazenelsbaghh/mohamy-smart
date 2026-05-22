# Plan: Defense Memo Adjustments and Custom Add Improvements

We will enhance the defense generation process to focus on challenges and objections (the "opposite" framing) rather than confirmation of facts, restore the manual add defense button, and allow selecting the type of the defense ("موضوعي" vs "شكلي" vs "متعلق بأدلة") during creation.

## Objectives
1. **Challenge-Based Defense Wording**: Modify backend defense generation prompts so they frame defenses as objections, invalidations, or pleas from the defendant's perspective (e.g. "بطلان الإعلان" instead of "صحة إجراءات الإعلان").
2. **Add Defense Type Selection**: Add a tab-like toggle selection in the new defense FormModal so the user can choose the type of manually created defense (Formal, Substantive, Evidentiary).
3. **Restore Add Defense Button**: Re-introduce the deleted `+ إضافة دفع جديد` button at the bottom of the defenses sidebar.

## Proposed Changes

### Backend Prompts
- Modify `defense-step2-generate-defenses.txt` to explicitly instruct the AI to construct defenses as objections/challenges/denials (the "opposite" of confirming the fact).
- Modify `defense-step3-analyze-defense.txt` to ensure the analysis aligns with the challenge-based title.

### Frontend
- Modify `DefensesList.tsx`:
  - Restore the missing `+ إضافة دفع جديد` button at the bottom of the `قائمة الدفوع` sidebar list.
  - Implement a segment button or radio buttons in the modal to select the defense type (`Formal` / `Substantive` / `Evidentiary`).
