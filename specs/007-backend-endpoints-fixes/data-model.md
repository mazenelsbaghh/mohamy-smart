# Data Model & Schema Alterations

This phase expands operations against existing entities. Minimal schema migrations are projected, primarily focusing on enforcing mutations logically.

## Entity: Lawyer (Existing)

- **Purpose**: Represents an active or suspended lawyer utilizing the Mohamy Smart platform.
- **Fields Impacted**:
  - `isActive`: Boolean flag indicating if the lawyer is authorized to log in and use features.
- **Relationships**:
  - N/A (Maintained)
- **Validation Rules**:
  - `isActive` must securely restrict or unrestrict their token footprint. It is validated via DB update hooks and subsequent Auth Token validations.

## Entity: Plan (Existing)

- **Purpose**: A subscription offering containing the subscription terms.
- **Fields Impacted**:
  - `Price`: Decimal property establishing monthly/tier value.
  - `Name` | `Limits` (optional) based on tier definition.
- **Relationships**:
  - One-To-Many towards actual subscribed `Payments` / Subscriptions.
- **Validation Rules**:
  - Minimum price rule check > 0.
  - Required fields constraint upon creation.

## Entities: DTOs (New)

- **LawyerAnalyticsDto**:
  - `TotalLawyers` (int)
  - `ActiveLawyers` (int)
  - `SuspendedLawyers` (int)
- **SubscriptionAnalyticsDto**:
  - `TotalRevenue` (decimal)
  - `ActiveSubscriptions` (int)
  - `ChurnedSubscriptions` (int)
