# Phase 0: Outline & Research

## Decision 1: Reporting Aggregation approach
- **Decision:** Use real-time LINQ aggregation queries in `Lawyer.Application` to generate Lawyer and Subscription Reports directly from SQL.
- **Rationale:** A reporting layer that depends on periodic cron jobs, a data warehouse, or materialized views is unnecessarily complex for the current scale. Real-time querying against EF tracked sets resolves the immediate need accurately while matching the sub-300ms requirement assuming appropriate DB indices exist.
- **Alternatives considered:** Materialized Views in SQL Server via CQRS worker (too complex for MVP phase), Background Sync cache utilizing Redis (adds infra overhead without immediate need).

## Decision 2: Plan Mutability Model
- **Decision:** Transform `Plan` from backend hardcoded configuration / immutable records into standard, mutable entity rows tracking historical relationships but allowing price mutation. For immutable history, rely on existing Stripe/Paymob subscription histories attached to `Payment` tables, protecting past records. The Admin simply mutates future price.
- **Rationale:** The dashboard requirements expect immediate mutability for the `Plan` (changing prices). This is the simplest approach allowing immediate Admin UI interaction.
- **Alternatives considered:** Versioning `Plan` entities (appending a new v2 Plan upon edit and archiving old one) — slightly more robust but overly complex without explicit specs requesting multi-version plans. 

## Decision 3: Authorization Strategy for New Endpoints
- **Decision:** Apply `[Authorize(Roles = "Admin")]` at the controller or action level for all novel `AdminAnalyticsController` and `AdminPlansController` capabilities.
- **Rationale:** Enforces Principle III (Role-Based Authorization) securely inside the .NET boundary without altering generic lawyer routes.
- **Alternatives considered:** Extending Lawyer reporting to admin via policy-based routing (less clear boundary logic).

*All underlying unknowns have been resolved. The architecture is cleared for Data Model and Contract generation.*
