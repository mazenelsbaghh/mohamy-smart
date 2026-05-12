# mohamy smart Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-12

## Active Technologies
- TypeScript 5.x / React 19 for lawyer dashboard; C# / .NET 9 for backend services + Redux Toolkit, React Router 7, HeroUI, SignalR client, Axios, Hangfire, EF Core 9, SQL Server, System.Text.Json (068-workflow-start-resume)
- SQL Server workflow tables, `AiJobs`, workflow snapshots, workflow step outputs, local browser state for selected facts only (068-workflow-start-resume)
- TypeScript 5.x / React 19 for lawyer dashboard; C# / .NET 9 for backend services + Redux Toolkit, React Router 7, HeroUI, Axios, EF Core 9, SQL Server, FluentValidation, System.Text.Json (069-internal-regulations)
- SQL Server tables for internal regulations, case-regulation links, and a denormalized case reference context used by existing workflow context building (069-internal-regulations)
- TypeScript 5.x / React 19 for admin dashboard; C# / .NET 9 for backend services + Redux Toolkit, React Router 7, HeroUI, Tailwind CSS 4, React Icons, Axios, EF Core 9, SQL Server, ASP.NET Core Authorization, System.Text.Json (070-lawyer-detail-profile)
- Existing SQL Server tables only: `AspNetUsers`, `Lawyers`, `LawyerSubscriptions`, `Subscriptions`, `Cases`, `Clients`, `PowerOfAttorneys`, `Reviews`, `AiUsageRecords` (070-lawyer-detail-profile)
- TypeScript 5.x / React 19 + Redux Toolkit, React Router 7, HeroUI, Tailwind CSS 4, lucide-react (071-page-ai-guidance)
- Local browser storage for lightweight guidance collapsed preferences; no database changes (071-page-ai-guidance)
- TypeScript 5.x / React 19 + React Router 7, lucide-react, Tailwind CSS 4, existing CSS variables, existing guidance component (072-guided-popup-tour)
- Local browser storage for page-specific popup dismissal; no backend persistence (072-guided-popup-tour)
- TypeScript 5.x / React 19 for lawyer dashboard + React Router 7, Redux Toolkit, HeroUI, shared UI components, lucide-react, date-fns (073-guidance-search-audit)
- Browser localStorage for per-page guidance dismissal only; existing Redux/API state for cases (073-guidance-search-audit)
- C# / .NET 9 backend; TypeScript 5.x / React 19 lawyer dashboard + ASP.NET Core Authorization, EF Core 9, Hangfire, SignalR, System.Text.Json, Redux Toolkit, React Router 7, HeroUI, Axios, react-hot-toast (074-ai-points-deduction)
- SQL Server 2022 via existing EF Core migrations; existing `AiJobs`, `AiUsageRecords`, `LawyerSubscription`, `Subscriptions` with new accounting fields/indexes (074-ai-points-deduction)

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
- 074-ai-points-deduction: Added C# / .NET 9 backend; TypeScript 5.x / React 19 lawyer dashboard + ASP.NET Core Authorization, EF Core 9, Hangfire, SignalR, System.Text.Json, Redux Toolkit, React Router 7, HeroUI, Axios, react-hot-toast
- 073-guidance-search-audit: Added TypeScript 5.x / React 19 for lawyer dashboard + React Router 7, Redux Toolkit, HeroUI, shared UI components, lucide-react, date-fns
- 072-guided-popup-tour: Added TypeScript 5.x / React 19 + React Router 7, lucide-react, Tailwind CSS 4, existing CSS variables, existing guidance component


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
