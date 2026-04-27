# Quickstart: Admin Analytics Dashboard

## Backend Implementation

1. Create the `IAnalyticsRepository` and `IAnalyticsService` interfaces.
2. Implement the SQL aggregation logic in `AnalyticsRepository.cs` using EF Core `GroupBy` and SQL functions to extract DAU/MAU and Financial metrics.
3. Wire up the `AnalyticsController` and protect it with `[Authorize(Roles = "Admin")]`.
4. Ensure the return types map to the JSON structure defined in `data-model.md` using `camelCase`.

## Frontend Implementation

1. Install `recharts` if not already installed:
   ```bash
   cd mohamy-smart-admin-dashboard
   npm install recharts
   ```
2. Create the `analyticsService.ts` to fetch data via Axios.
3. Build the `AnalyticsDashboard.tsx` container component.
4. Build the 4 major presentation components:
   - `FinancialKPIs` (Cards for MRR, Revenue)
   - `SubscriptionLifecycle` (Funnel/Bar chart for Churn vs Renewals)
   - `UserEngagement` (Line chart for DAU/MAU)
   - `CohortAnalysis` (Heatmap or Grid layout)
5. Hook up the dashboard to the `AdminRoute` layout in `App.tsx`.
