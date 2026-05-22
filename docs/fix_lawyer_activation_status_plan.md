# Plan: Fix Lawyer Activation Status Bug

Fix the lawyer activation status toggle bug by ignoring global query filters on `ApplicationUser` during the status update lookup.

## Problem Description

When an admin suspends a lawyer, both `Lawyer.IsActive` and `ApplicationUser.IsActive` are set to `false`. 
Because `ApplicationUser` has a global query filter `u => u.IsActive`, querying `Lawyer` while including `ApplicationUser` without `.IgnoreQueryFilters()` results in the query returning `null` (since the required joined user is inactive and filtered out). This causes subsequent attempts to activate the lawyer to fail with a `404 Not Found` ("Lawyer not found").

## Proposed Changes

### Backend

#### [MODIFY] [AdminLawyerService.cs](file:///Users/mazenelsbagh/mazen%20mac/apps/mohamy%20smart/mohamy-smart-backend/Lawyer.Application/Services/AdminLawyerService.cs)
Update `UpdateLawyerStatusAsync` to use `.IgnoreQueryFilters()` when querying the lawyer and its associated `ApplicationUser` from the database:

```csharp
		public async Task<Result<string>> UpdateLawyerStatusAsync(Guid lawyerId, bool isActive, CancellationToken cancellationToken)
		{
			var lawyer = await _unitOfWork.Repository<Core.Models.Lawyer>()
				.AsQueryable()
				.IgnoreQueryFilters()
				.Include(l => l.ApplicationUser)
				.FirstOrDefaultAsync(l => l.Id == lawyerId || l.ApplicationUserId == lawyerId, cancellationToken);
```

## Verification Plan

### Manual Verification
1. Log in to the admin dashboard, navigate to the lawyers list (`/lawyers`).
2. Identify a lawyer who is suspended (موقوف).
3. Click "تنشيط" (Activate).
4. Verify the status updates to "نشط" (Active) successfully without any `404 Not Found` error.
5. Click "إيقاف" (Suspend) on an active lawyer, and verify it successfully suspends.
6. Click "تنشيط" (Activate) again to confirm it can be toggled back and forth successfully.
