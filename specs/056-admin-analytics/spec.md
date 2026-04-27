# Feature Specification: Admin Analytics Dashboard

**Feature Branch**: `056-admin-analytics`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "Add detailed performance and analytics tracking to the Admin Dashboard including Financial & Subscriptions Performance (MRR, total revenue, one-month churners, renewals, refunds, upgrades) and User Engagement & Usage (DAU/MAU, power users, AI usage limits, and cohort analysis)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Financial Health Monitoring (Priority: P1)

As a system administrator, I want to view detailed financial metrics so that I can understand the revenue generated, recurring income, and monitor the financial health of the subscriptions.

**Why this priority**: Revenue is the primary indicator of business success. Administrators need to track MRR and total revenue to make informed business decisions.

**Independent Test**: Can be fully tested by verifying the financial KPI dashboard displays accurate Total Revenue, MRR, Total Refunds, and ARPU based on underlying payment and subscription data.

**Acceptance Scenarios**:

1. **Given** the administrator navigates to the analytics dashboard, **When** they view the financial section, **Then** they see real-time or near real-time values for Total Revenue, MRR, Refunds, and ARPU.
2. **Given** there are new subscriptions or recent refunds, **When** the financial metrics update, **Then** the metrics correctly reflect the net changes in revenue and recurring income.

---

### User Story 2 - Subscription Lifecycle Tracking (Priority: P1)

As a system administrator, I want to track the lifecycle of user subscriptions (new, one-month churners, renewals, upgrades, and refunds) so that I can identify patterns in customer retention and attrition.

**Why this priority**: Tracking why and when users churn (especially after just one month) or upgrade helps the business understand product value and improve retention strategies.

**Independent Test**: Can be fully tested by validating the subscription flow table and ensuring that user categorization (new, churned, renewed, upgraded) matches their billing history.

**Acceptance Scenarios**:

1. **Given** a set of active and past subscriptions, **When** the administrator views the subscription breakdown, **Then** the numbers accurately show how many users are one-month churners, renewals, upgrades, and refunds.
2. **Given** an administrator wants to dive deeper, **When** they click on the one-month churners category, **Then** they see a detailed list of lawyers falling into this category with their registration and subscription history.

---

### User Story 3 - Lawyer Engagement and Usage Tracking (Priority: P2)

As a system administrator, I want to monitor user engagement metrics (DAU, MAU, dormant users, super users) and AI feature adoption so that I can ensure the platform is actively providing value to the lawyers.

**Why this priority**: Even if financial metrics look good, low engagement predicts future churn. Tracking daily/monthly active users and identifying super users vs dormant users helps proactively manage retention.

**Independent Test**: Can be fully tested by ensuring engagement KPIs correctly aggregate user login and activity logs, highlighting the most and least active lawyers.

**Acceptance Scenarios**:

1. **Given** the analytics dashboard is loaded, **When** the administrator views the user engagement section, **Then** they see accurate metrics for Daily Active Users (DAU) and Monthly Active Users (MAU).
2. **Given** the system tracks feature usage, **When** viewing the AI adoption report, **Then** the administrator can see how many users have utilized AI features and how close they are to their usage limits.
3. **Given** the administrator wants to identify active vs inactive users, **When** viewing the activity breakdown, **Then** they can distinguish between "Power Users" and "Dormant Users".

---

### User Story 4 - Cohort Analysis for User Retention (Priority: P3)

As a system administrator, I want to view a cohort analysis of user retention over time so that I can see how long users from specific sign-up periods continue to use the system.

**Why this priority**: Cohort analysis provides the deepest insight into long-term product stickiness, showing exactly when engagement drops off for a given group of users over subsequent months.

**Independent Test**: Can be fully tested by comparing the retention heatmap against historical user activity data across multiple months.

**Acceptance Scenarios**:

1. **Given** historical user registration and activity data, **When** the administrator views the cohort analysis heatmap, **Then** they see the percentage of retained users for each monthly cohort over subsequent months.

### Edge Cases

- What happens when a user upgrades and then requests a refund within the same billing cycle? (How is this reflected in MRR and Refunds?)
- How does the system handle "one-month churners" who return and subscribe again after 6 months? Are they counted as new subscribers or reactivated?
- What happens when historical data is purged or unavailable for cohort analysis?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate and display Total Revenue, Monthly Recurring Revenue (MRR), Total Refunds, and Average Revenue Per User (ARPU).
- **FR-002**: System MUST categorize and display subscription lifecycle metrics: Total New Subscribers, One-Month Churners, Renewals, Upgrades, and Refunds/Cancellations.
- **FR-003**: System MUST provide a detailed grid/table showing the subscription flow of individual users (User Name, Plan, Start Date, Renewal Status, Refund Status, Total Paid).
- **FR-004**: System MUST track and display Daily Active Users (DAU) and Monthly Active Users (MAU).
- **FR-005**: System MUST identify and categorize "Dormant Users" (users with active subscriptions who have not logged in for a defined period) and "Power Users" (users with the highest activity volume).
- **FR-006**: System MUST track and display AI adoption metrics, including the number of users who utilized AI features and those who reached their usage limits.
- **FR-007**: System MUST generate a cohort analysis heatmap showing user retention percentages over a rolling multi-month period.

### Key Entities *(include if feature involves data)*

- **SubscriptionAnalytics**: Aggregated entity representing financial KPIs (MRR, Total Revenue, Refunds).
- **UserActivityLog**: Entity tracking user logins and feature interactions used to calculate DAU/MAU and Dormant/Power users.
- **UserSubscriptionLifecycle**: Entity representing a user's subscription journey (Start, Renew, Upgrade, Churn, Refund).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can view real-time or near real-time (updated at least daily) financial metrics and subscription lifecycle categorizations.
- **SC-002**: System accurately identifies 100% of "one-month churners" and "dormant users" based on billing and activity data.
- **SC-003**: Cohort analysis correctly maps user retention up to 12 months for any given monthly cohort.
- **SC-004**: The analytics dashboard loads all aggregated metrics and charts in under 3 seconds to ensure a smooth administrative experience.

## Assumptions

- Historical payment and activity data needed for cohort analysis and churn tracking is already present and accessible in the database.
- "Dormant User" is assumed to be an active subscriber who has not logged in for the past 14 days (unless specified otherwise).
- Financial metrics are calculated based on successful payment events and successful refund events recorded in the system.
