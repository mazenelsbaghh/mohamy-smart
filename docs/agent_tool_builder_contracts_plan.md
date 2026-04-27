# Agent Tool Builder — Contract Generation Improvements Plan

**Created**: 2026-04-22
**Status**: ✅ Completed

## Objective
Apply Agent Tool Builder principles to improve the AI Contract Generation pipeline quality, error handling, and output structure.

## Tasks

### P1 — High Priority

- [x] **Task 1**: Update Prompt Template → Add structured output format with clear sections
  - File: `Lawyer/wwwroot/prompts/legal-contracts/legal-contract-draft.txt`
  
- [x] **Task 2**: Add `AIRequestOptions.ForContractDraft` preset
  - File: `Lawyer.Application/IServices/AI/IAIProvider.cs`

- [x] **Task 3**: Error Categorization — Classify AI failures into actionable categories
  - File: `Lawyer.Application/Services/LegalContractService.cs`

- [x] **Task 4**: DTO Input Examples — Add XML docs, improve error messages with guidance
  - File: `Lawyer.Application/Dtos/Contracts/CreateLegalContractRequestDto.cs`

- [x] **Task 5**: Output Validation — Validate AI response has required contract sections
  - File: `Lawyer.Application/Services/LegalContractService.cs`

### P2 — Medium Priority

- [ ] **Task 6**: Prompt Versioning — Add `PromptVersion` to LegalContract entity
  - File: `Lawyer.Core/Models/LegalContract.cs`

- [x] **Task 7**: AI Retry with Self-Correction — Auto-fix incomplete outputs (merged into Task 3/5)
  - File: `Lawyer.Application/Services/LegalContractService.cs`

## Files Modified
| File | Change |
|---|---|
| `legal-contract-draft.txt` | Restructured prompt with output format |
| `IAIProvider.cs` | Added ForContractDraft preset |
| `LegalContractService.cs` | Error categorization + validation + retry |
| `CreateLegalContractRequestDto.cs` | Better descriptions and examples |
