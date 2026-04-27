# Branded ConfirmDialog — Full Platform Rollout

## Objective
Replace ALL native browser dialogs (`window.confirm`, `confirm()`) and inline HeroUI modals used for confirmations with a unified, branded `ConfirmDialog` component using glassmorphism (transparent + blur) across both dashboards.

## Design: Glassmorphism ConfirmDialog
- `bg-white/70` + `backdrop-blur-2xl` (transparent, not solid)
- `border-white/30` subtle glass border
- Backdrop: `bg-black/20 backdrop-blur-sm`
- Cancel button: `bg-white/50 backdrop-blur-md` (glass)
- Confirm button: `--main-color` (orange) or `--danger-color` (red)
- Contextual icon: 🗑️ trash for danger, ⚠️ alert for normal
- RTL-aware, Tajawal-compatible

## Changes Made

### Lawyer Dashboard
| File | Before | After |
|------|--------|-------|
| `components/common/ConfirmDialog.tsx` | Solid `--surface-color` bg | **Glassmorphism** bg-white/70 + blur |
| `pages/cases/subPagesCases/SnapshotsHistory.tsx` | `window.confirm()` | ✅ Branded `ConfirmDialog` |
| `pages/processServerPapers/ProcessServerPapersList.tsx` | `confirm()` | ✅ Branded `ConfirmDialog` |
| `pages/clients/ClientDetails.tsx` | `confirm()` × 2 (POA cancel + file delete) | ✅ Branded `ConfirmDialog` × 2 |
| `components/sidebar/Sidebar.tsx` | Already using `ConfirmDialog` | ✅ Inherits glass style |
| `analysis/.../DefensesList.tsx` | Already using `ConfirmDialog` | ✅ Inherits glass style |
| `analysis/.../FinalNote.tsx` | Already using `ConfirmDialog` | ✅ Inherits glass style |

### Admin Dashboard
| File | Before | After |
|------|--------|-------|
| `components/ui/modal/ConfirmDialog.tsx` | ❌ Didn't exist | ✅ Created (same glass design) |
| `pages/plansAndReview/PlansAndReview.tsx` | Inline HeroUI Modal | ✅ Branded `ConfirmDialog` |
| `components/public/sidebar/Sidebar.tsx` | Inline HeroUI Modal | ✅ Branded `ConfirmDialog` |

## Verification
- ✅ `npx tsc --noEmit` passes for both dashboards
- ✅ Zero remaining `window.confirm`, `window.alert`, or bare `confirm()` calls
- ✅ All 9 confirmation points across the platform now use the branded component
