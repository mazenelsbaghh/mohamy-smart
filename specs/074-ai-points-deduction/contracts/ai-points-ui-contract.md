# Contract: AI Points UI

**Feature**: AI Points Deduction  
**Date**: 2026-05-12

## Purpose

Define the lawyer-dashboard behavior for displaying AI point costs, preventing accidental repeated charges, showing no-charge errors, and reflecting final balance changes.

## Initial AI Action

For first-time AI actions:

- The action area must show the point cost before submission when the action is chargeable.
- The submit button must be disabled while an equivalent job is already queued or processing.
- If the backend rejects the request for insufficient points, show an Arabic message and do not enter loading state.
- The UI must not locally decrement the visible balance before backend confirmation.

Recommended Arabic copy:

- Cost label: `تكلفة هذا الطلب: نقطة واحدة`
- Submit pending note: `سيتم خصم النقاط فقط إذا اكتملت النتيجة بنجاح.`
- Insufficient points: `رصيد النقاط غير كافٍ لتشغيل هذا الطلب.`

## Retry After Failure

When a failed AI request exposes retry:

1. User clicks retry.
2. UI opens a confirmation dialog before dispatching the request.
3. Dialog shows:
   - AI action name.
   - Point cost.
   - Current available balance if known.
   - Clear statement that points are deducted only if retry succeeds.
4. Decline closes dialog and leaves the failed state unchanged.
5. Accept submits a repeat request with `repeatIntent = RetryAfterFailure`.

Required Arabic confirmation copy:

```text
إعادة المحاولة ستنشئ طلب ذكاء اصطناعي جديد.
سيتم خصم نقطة واحدة من رصيدك إذا اكتملت النتيجة بنجاح.
لن يتم خصم أي نقاط إذا فشلت المحاولة.
```

Primary action: `تأكيد وإعادة المحاولة`  
Secondary action: `إلغاء`

## Regenerate / Re-run / Start Over

When a successful output can be regenerated, re-run, or replaced:

1. User clicks regenerate/re-run/start-over.
2. UI opens a confirmation dialog before dispatching any request.
3. Dialog states that the existing result remains unless the new request succeeds.
4. Decline leaves existing result unchanged.
5. Accept submits a repeat request with the correct repeat intent.

Required Arabic confirmation copy:

```text
إعادة التشغيل ستنشئ نتيجة جديدة وقد تستبدل النتيجة الحالية بعد النجاح.
سيتم خصم نقطة واحدة من رصيدك إذا اكتملت النتيجة الجديدة بنجاح.
```

Primary action examples:

- `تأكيد وإعادة التوليد`
- `تأكيد وإعادة التشغيل`
- `تأكيد وبدء نسخة جديدة`

## Success Feedback

When a job completes and charge metadata shows `Charged`:

- Show a short Arabic toast or inline status.
- Update visible balance using backend-provided balance.
- Do not show duplicate success toasts for the same job after refresh.

Recommended Arabic copy:

```text
تم خصم نقطة واحدة بعد اكتمال الطلب بنجاح.
```

## Failure / No-Charge Feedback

When a job fails, conflicts, is cancelled, times out, or returns unusable output:

- Show the existing error state.
- Add explicit no-charge feedback from charge metadata.
- Keep retry visible only when retry is allowed.
- Do not change balance unless backend says a hold was restored.

Recommended Arabic copy:

```text
لم يتم خصم أي نقاط لأن الطلب لم يكتمل بنجاح.
```

## Balance Display

Where AI actions are visible, the UI should be able to show:

- Available points.
- Cost of the current action.
- Whether a request is pending charge.
- Final charge/no-charge state after completion or failure.

Minimum status labels:

| State | Arabic Label |
|-------|--------------|
| Pending | في انتظار اكتمال الطلب |
| Charged | تم الخصم |
| NoCharge | لم يتم الخصم |
| Restored | تم استرجاع النقاط |
| Insufficient | رصيد غير كافٍ |

## Accessibility and Interaction Rules

- Confirmation dialog must trap focus and be dismissible with cancel/close.
- The primary confirm button must remain disabled while the repeat request is submitting.
- Buttons must not shift layout when charge labels appear.
- Messages must be RTL and use the existing Arabic typography.
- Duplicate clicks must not dispatch duplicate submit actions.

## Refresh and Resume Rules

- On refresh, the UI must hydrate charge metadata from job status instead of assuming local state.
- If a job is still queued/processing, show pending-charge messaging.
- If the job completed before refresh, show charged state without submitting a new request.
- If the job failed before refresh, show no-charge state and retry confirmation path.

## Non-Chargeable Views

- Viewing prior AI output, historical snapshots, completed stages, or admin usage reports must not show a charge confirmation.
- Historical views may show past charge history, but must not allow new chargeable actions unless the user starts an explicit new run or retry flow.

## Implementation Notes

- Shared AI point UI lives under `apps/lawyer-dashboard/src/components/aiPoints/`.
- Failed-step retry confirmation is enforced before dispatching retry metadata; defense memo regenerate/retry uses the shared `AiPointConfirmDialog`.
- The subscription settings page displays current AI point balance and recent point history.
- Admin AI usage summary now includes charged point totals and no-charge transaction totals.
