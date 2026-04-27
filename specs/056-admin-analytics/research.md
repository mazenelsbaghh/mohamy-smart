# Phase 0: Research & Decisions

## 1. EF Core Aggregation for Cohort Analysis
- **Unknown/Challenge**: Cohort analysis requires grouping users by their join month and then checking their activity/subscription status in subsequent months (Month 1, Month 2, etc.). Doing this entirely in-memory is too slow for large datasets.
- **Decision**: Use RAW SQL or optimized EF Core `.GroupBy()` combined with `.Select()` to execute the aggregation on the SQL Server side. For complex heatmaps, we will fetch base aggregated data (User IDs and Join/Active Dates) and perform the final matrix assembly in the Application layer (C#) before sending it to the frontend. 
- **Rationale**: Keeps database queries simple and avoids EF Core translation errors with complex date math, while still offloading the heavy filtering to SQL Server.
- **Alternatives considered**: Stored Procedures or Database Views. Rejected to keep logic centralized in the Application/Infrastructure layer using standard EF practices.

## 2. Tracking Daily/Monthly Active Users (DAU/MAU)
- **Unknown/Challenge**: How do we define an "Active User" without introducing performance bottlenecks when logging every request?
- **Decision**: Rely on the existing `RefreshToken` updates or a dedicated `LastLoginAt` field on the `ApplicationUser` or `Subscription` table, rather than a heavy audit log of every single request. A user is counted in DAU if their `LastLoginAt` matches the current day.
- **Rationale**: Extremely fast to query (`Count()` where `LastLoginAt >= Date`) and requires no additional writes beyond standard authentication flows.

## 3. Frontend Charting Library
- **Unknown/Challenge**: Need a robust React charting library that supports RTL and integrates well with Tailwind CSS 4 and HeroUI.
- **Decision**: Use `Recharts`.
- **Rationale**: `Recharts` is highly customizable via CSS variables (which fits perfectly with Tailwind and our Pro Max UI `--main-color` variables). It is also SVG-based, which scales cleanly and supports RTL well with proper layout configuration.
- **Alternatives considered**: `Chart.js` (requires canvas, harder to style dynamically with CSS variables), `Nivo` (heavier bundle size).
