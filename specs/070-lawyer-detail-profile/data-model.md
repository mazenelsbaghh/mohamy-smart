# Data Model: Lawyer Detail Profile

## AdminLawyerDetail

Admin-facing aggregate returned by `GET /api/v1/lawyers/{userId}`.

### Fields

- `id`: Application user ID used by the existing admin route.
- `lawyerId`: Linked lawyer profile ID. Nullable when a user record exists without a professional profile.
- `fullName`, `email`, `phoneNumber`: Primary identity and contact data.
- `isActive`: Application user active state.
- `phoneNumberConfirmed`, `emailConfirmed`: Verification indicators from Identity.
- `userType`: Existing user type enum.
- `createdAt`: Account creation timestamp.
- `governorate`, `agreedToTerms`: Account metadata when available.
- `barNumber`, `specialization`, `experienceNumber`, `lawFirmName`, `birthDate`: Professional profile fields.
- `lawyerProfileCreatedAt`: Linked lawyer profile creation date.
- `subscription`: Current subscription summary, nullable.
- `activity`: Aggregated operational counts and AI usage totals.
- `recentCases`: Latest five case summaries.
- `recentSubscriptions`: Latest three subscription summaries.
- `recentReviews`: Latest three review summaries.
- `recentAiUsage`: Latest five AI usage summaries.

### Validation Rules

- `id` must be a valid GUID and must match an existing `ApplicationUser`.
- The route remains admin-only.
- Lists are bounded server-side; UI must not assume more than the documented limits.
- Nullable fields must render as neutral Arabic placeholders, not blank controls.

## LawyerSubscriptionSummary

Current or recent subscription attached to the lawyer profile.

### Fields

- `id`: Lawyer subscription ID.
- `planName`: Subscription name.
- `isActive`: Active state.
- `startDate`, `endDate`: Coverage window.
- `durationDays`: Plan duration when available.
- `aiRequestsLimit`: AI limit from the plan.
- `usedAiRequests`: Used AI requests from the lawyer subscription.
- `price`, `yearlyPrice`: Pricing values when available.

### State Notes

- Current subscription is the active subscription with the most recent `EndDate`; if none exists, use the latest historical subscription as context and mark it inactive.

## LawyerActivitySummary

Counts and usage totals used by the operational cards.

### Fields

- `casesCount`, `activeCasesCount`: Case totals for this lawyer.
- `clientsCount`: Client total.
- `powersOfAttorneyCount`, `activePowersOfAttorneyCount`: Power of attorney totals.
- `reviewsCount`, `approvedReviewsCount`, `pendingReviewsCount`: Review totals by status.
- `averageReviewRating`: Nullable average rating.
- `aiUsageCount`: AI usage row count.
- `aiTotalTokens`: Sum of total tokens.
- `aiEstimatedCostUsd`: Sum of estimated cost.
- `lastActivityAt`: Latest timestamp among account/profile/activity records.

## RecentLawyerCase

Compact recent case row.

### Fields

- `id`, `title`, `number`, `court`, `clientName`, `status`, `created`, `isActive`.

## RecentLawyerReview

Compact review row.

### Fields

- `id`, `reviewerName`, `reviewerRole`, `rating`, `status`, `comment`, `created`.

## RecentLawyerAiUsage

Compact AI usage row.

### Fields

- `id`, `caseId`, `aiStepType`, `provider`, `modelIdentifier`, `totalTokens`, `estimatedCostUsd`, `createdAt`.

## Admin Detail View State

Frontend-only state derived from Redux loading/error and selected detail.

### States

- `loading`: Fetch in progress.
- `loaded`: Detail payload available.
- `notFound`: API returns not found or no selected lawyer.
- `failed`: API request fails.
- `emptyOptionalData`: Loaded payload has missing optional fields.
