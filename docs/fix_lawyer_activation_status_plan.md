# Plan: Fix Lawyer Activation Status Bug & Limit Trial Subscription

Fix the lawyer activation status toggle bug by ignoring global query filters on `ApplicationUser` during the status update lookup, and ensure that a lawyer can only receive the trial subscription once (upon first activation), preventing reactivation, renewal, or multiple subscriptions to it.

## Problem Description

1. When an admin suspends a lawyer, both `Lawyer.IsActive` and `ApplicationUser.IsActive` are set to `false`. Because `ApplicationUser` has a global query filter `u => u.IsActive`, querying `Lawyer` while including `ApplicationUser` without `.IgnoreQueryFilters()` results in the query returning `null`. This causes subsequent attempts to activate the lawyer to fail with a `404 Not Found` ("Lawyer not found").
2. When reactivating a lawyer, if they don't have an active subscription, the system previously renewed/reactivated their trial subscription (resetting requests and end dates). The user wants to ensure that a lawyer can never have/subscribe to the trial subscription twice. It should only be given once when their account is first activated.

## Proposed Changes

### Backend

#### [MODIFY] [AdminLawyerService.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer.Application/Services/AdminLawyerService.cs)
Update `UpdateLawyerStatusAsync` to:
1. Ignore query filters on lookup.
2. If `isActive` is `true` and the lawyer has no active subscription:
   - Check if they have an existing trial subscription (`existingTrialSub`).
   - If they do, **do not** reactivate or renew it (do nothing).
   - If they do not, create a new trial subscription.

#### [MODIFY] [AuthService.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer.Application/Services/AuthService.cs)
Update the OTP verification/activation logic to check if a trial subscription already exists before creating a new one.

#### [MODIFY] [SubscriptionService.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer.Application/Services/SubscriptionService.cs)
Update `SubscribeAsync` to return a `BadRequest` error if a lawyer attempts to subscribe to the trial plan and they already have a trial subscription record.

## Verification Plan

### Manual Verification
1. Activate a new lawyer who has never had a subscription, and verify they receive the trial subscription.
2. Verify that if a lawyer's trial subscription has expired, deactivating and reactivating the lawyer does NOT renew or reactivate the trial subscription.
3. Verify that trying to subscribe to the trial subscription via the subscription service endpoint when already having a trial subscription returns a Bad Request error.

