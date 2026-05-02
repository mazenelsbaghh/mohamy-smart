# mohamy smart Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-02

## Active Technologies
- TypeScript 5.x / React 19 for lawyer dashboard; C# / .NET 9 for backend services + Redux Toolkit, React Router 7, HeroUI, SignalR client, Axios, Hangfire, EF Core 9, SQL Server, System.Text.Json (068-workflow-start-resume)
- SQL Server workflow tables, `AiJobs`, workflow snapshots, workflow step outputs, local browser state for selected facts only (068-workflow-start-resume)
- TypeScript 5.x / React 19 for lawyer dashboard; C# / .NET 9 for backend services + Redux Toolkit, React Router 7, HeroUI, Axios, EF Core 9, SQL Server, FluentValidation, System.Text.Json (069-internal-regulations)
- SQL Server tables for internal regulations, case-regulation links, and a denormalized case reference context used by existing workflow context building (069-internal-regulations)
- TypeScript 5.x / React 19 for admin dashboard; C# / .NET 9 for backend services + Redux Toolkit, React Router 7, HeroUI, Tailwind CSS 4, React Icons, Axios, EF Core 9, SQL Server, ASP.NET Core Authorization, System.Text.Json (070-lawyer-detail-profile)
- Existing SQL Server tables only: `AspNetUsers`, `Lawyers`, `LawyerSubscriptions`, `Subscriptions`, `Cases`, `Clients`, `PowerOfAttorneys`, `Reviews`, `AiUsageRecords` (070-lawyer-detail-profile)

- TypeScript 5.x / React 19 + Redux Toolkit, React Router 7, HeroUI, Tailwind CSS 4 (065-unify-workflow-arch)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x / React 19: Follow standard conventions

## Recent Changes
- 070-lawyer-detail-profile: Added TypeScript 5.x / React 19 for admin dashboard; C# / .NET 9 for backend services + Redux Toolkit, React Router 7, HeroUI, Tailwind CSS 4, React Icons, Axios, EF Core 9, SQL Server, ASP.NET Core Authorization, System.Text.Json
- 069-internal-regulations: Added TypeScript 5.x / React 19 for lawyer dashboard; C# / .NET 9 for backend services + Redux Toolkit, React Router 7, HeroUI, Axios, EF Core 9, SQL Server, FluentValidation, System.Text.Json
- 068-workflow-start-resume: Added TypeScript 5.x / React 19 for lawyer dashboard; C# / .NET 9 for backend services + Redux Toolkit, React Router 7, HeroUI, SignalR client, Axios, Hangfire, EF Core 9, SQL Server, System.Text.Json


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
