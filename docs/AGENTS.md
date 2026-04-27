# mohamy smart Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-19

## Active Technologies
- TypeScript / React 19 + Vite for the Lawyer Dashboard, C# / .NET 6+ Web API for supporting backend changes + Redux Toolkit, Axios, React Hook Form, Zod, HeroUI, ASP.NET Core, Entity Framework Core, JWT authentication, Paymob integration, AI provider factory (008-lawyer-dashboard-polish)
- SQL Server for persistent domain data, browser local storage for access and refresh token persistence (008-lawyer-dashboard-polish)
- TypeScript / React 19 + Vite for the Admin and Lawyer Dashboards, TypeScript / Next.js 16 for the Landing Page, C# / .NET 9 Web API for backend changes + Redux Toolkit, Axios, React Hook Form, Zod, HeroUI, React Router, ASP.NET Core, Entity Framework Core, ASP.NET Identity, JWT authentication (010-remaining-code-fixes)
- SQL Server 2022 for profile, notification, and contact-request persistence; browser local storage for dashboard access and refresh tokens (010-remaining-code-fixes)
- TypeScript / React 19 + Vite for dashboard changes, C# / .NET 9 Web API for backend changes + Redux Toolkit, Axios, React Router, React Hook Form, Zod, HeroUI, ASP.NET Core, Entity Framework Core, ASP.NET Identity, JWT authentication, MailKit, Serilog, Sentry SDKs, xUnit, Moq, FluentAssertions, Vitest, React Testing Library (011-code-fixes-a)
- SQL Server 2022 for subscriptions, contact requests, notification-related business data, and email failure records; browser local storage for dashboard access and refresh tokens (011-code-fixes-a)
- C# / .NET 9 backend, TypeScript / React 19 + Vite dashboards, TypeScript / Next.js 16 landing, Docker Compose for orchestration + ASP.NET Core Web API, Entity Framework Core, SQL Server 2022 container, Vite dev servers, Next.js static export, nginx runtime images (012-docker-setup)
- SQL Server 2022 persisted in named Docker volume locally; production supports either container-managed or external SQL Server; backend log persistence required in local and production runtime scope (012-docker-setup)
- C# / .NET 9 backend, TypeScript / React 19 + Vite dashboards, TypeScript / Next.js 16 landing, shell-based project scripts + ASP.NET Core configuration binding, Vite environment injection, Next.js public environment variables, Docker Compose, nginx runtime configuration, SQL Server connectivity, external AI/payment/email/error-tracking providers (013-environment-config)
- File-based configuration templates in the repository root and app folders; SQL Server remains a configured runtime dependency rather than new feature storage (013-environment-config)
- GNU Make command targets orchestrating Docker Compose, .NET 9 CLI, Node/npm-based dashboard commands, and shell utilities + Docker Compose, SQL Server 2022 container, .NET 9 SDK/runtime tooling, npm scripts in both React dashboards, existing root environment templates (`.env.docker.example`, `.env.docker.prod.example`) (014-project-makefile)
- SQL Server 2022 in a named Docker volume for local development; backend log volume for runtime logs; root environment files for command configuration (014-project-makefile)
- C# / .NET 9 backend, Docker Compose, GNU Make, Markdown operational documentation + ASP.NET Core startup pipeline, Entity Framework Core migrations, SQL Server 2022 container, root `Makefile`, root `docker-compose.yml`, backend `DataSeed` seeding flow (015-local-db-setup)
- Local SQL Server 2022 data and operational logs persisted in the named Docker volume `mohamy-sqlserver-data`; backend runtime logs persisted separately in `mohamy-backend-logs` (015-local-db-setup)
- C# (.NET 9), TypeScript (React 19 / Next.js 16) + ASP.NET Core Web API, Entity Framework Core, ASP.NET Identity, React Hook Form, Zod, HeroUI, Axios (016-user-registration)
- C# / .NET 9 (Backend), TypeScript / React 19 (Dashboards), TypeScript / Next.js 16 (Landing) + ASP.NET Core MVC, Entity Framework Core, React Hook Form, Zod, HeroUI, Tailwind CSS 4, Axios (016-user-registration)
- SQL Server 2022 (Docker container locally) (016-user-registration)
- C# / .NET 9 (Backend), TypeScript / React 19 + Vite (Frontend) + HeroUI, Tailwind CSS 4, Redux Toolkit, Axios, React Hook Form, Zod, react-hot-toas (018-clients-management)
- SQL Server 2022 — EF Core migration required for new Client fields (018-clients-management)
- C# (.NET 9) backend, TypeScript (React 19 / Vite) dashboards + EF Core, ASP.NET Core Web API, React-Hook-Form, Zod, HeroUI (019-sessions-agenda)
- C# (.NET 9), TypeScript (React 19 / Vite) + ASP.NET Core Web API, Entity Framework Core, React Hook Form, Zod, HeroUI, Redux Toolkit, Axios, `xlsx` (for Excel export) (020-lawyer-protection)
- SQL Server 2022 (Docker container locally), local file system for receipt uploads. (020-lawyer-protection)
- C# / .NET 9 (Backend), TypeScript / React 19 + Vite (Admin Dashboard) + ASP.NET Core Web API, EF Core, Redux Toolkit, Axios, React Hook Form, Zod, HeroUI (021-ai-model-config)
- SQL Server 2022 (new `AiStageModelConfigs` table) (021-ai-model-config)
- TypeScript 5.x / React 19 + Vite + HeroUI, Redux Toolkit, React Router DOM, react-icons/io5, Tailwind CSS 4 (028-unify-analysis-layout)
- Redux AI Jobs queue and polling pattern (`useAiJobSignalR`) for non-blocking multi-step workflows (028-unify-analysis-layout)
- C# 13, .NET 9 Web API + ASP.NET Core, Hangfire (presumably running the worker job), Entity Framework Core (029-ai-jobs-worker)
- C# 13, .NET 9 + ASP.NET Core, Entity Framework Core, System.Text.Json (032-generic-workflow-infrastructure)
- C# 13 / .NET 9 + ASP.NET Core, `System.Text.Json` (033-unified-parsing)
- SQL Server 2022 (via EF Core, used conceptually to store the raw JSON strings that we're validating). (033-unified-parsing)
- TypeScript / React 19 + Vite + Redux Toolkit, Axios, Reac (035-frontend-redux-unification)
- N/A (In-memory Redux store only) (035-frontend-redux-unification)
- TypeScript / React 19 + Vite + @heroui/react, Redux Toolkit, React-Redux, Tailwind v4 (036-appeal-frontend)
- N/A (In-memory Redux store) (036-appeal-frontend)
- C# 13, .NET 9 Web API (Backend) / TypeScript, React 19 (Frontend) + `Lawyer.Core`, `Lawyer.Application` (Domain logic) (037-consistency-naming)
- SQL Server 2022 (EF Core `IUnitOfWork` pattern) (037-consistency-naming)
- C# (.NET 9) + ASP.NET Core, Entity Framework Core (038-phase8-documentation)
- N/A (In-memory configuration / static registry) (038-phase8-documentation)
- C# 13, .NET 9 + ASP.NET Core, System.Text.Json, Entity Framework Core (039-backend-unification)
- C# 13, .NET 9 Web API, TypeScript 5.x, React 19 + ASP.NET Core, Entity Framework Core, System.Text.Json, Redux Toolkit, React Router DOM (041-phase3-consistency)
- SQL Server 2022 (EF Core via abstract IUnitOfWork) (041-phase3-consistency)
- C# 13 / .NET 9 (Backend), TypeScript 5.x / React 19 (Frontend) + ASP.NET Core, Entity Framework Core, System.Text.Json, Redux Toolkit, Axios (042-fix-data-flow)
- SQL Server 2022 (no schema changes — fixing serialization of existing columns) (042-fix-data-flow)
- C# / .NET 9 Web API (Backend), TypeScript / React 19 (Frontend) + ASP.NET Core, EF Core, System.Text.Json, Redux Toolkit, Axios (043-global-auto-save)
- SQL Server 2022 (Local Docker & Prod) (043-global-auto-save)
- C# 13 / .NET 9 (Backend), TypeScript 5.x / React 19 (Frontend) + ASP.NET Core Web API, Entity Framework Core, Redux Toolkit, Axios, HeroUI, React Hook Form, Zod (044-stabilize-patch)
- SQL Server 2022 (Docker container locally, remote in production) (044-stabilize-patch)
- C# 13 / .NET 9 + ASP.NET Core Web API, Entity Framework Core, System.Text.Json (045-backend-unification)
- SQL Server 2022 (Docker container locally; remote in production) (045-backend-unification)
- TypeScript 5.x / React 19 + Vite (Lawyer Dashboard) + Redux Toolkit, Axios, HeroUI, Tailwind CSS 4, SignalR, react-hot-toas (046-frontend-unification-autosave)
- N/A (Redux in-memory state; backend API for persistence — no frontend schema changes) (046-frontend-unification-autosave)
- TypeScript 5.x / React 19 + Vite + HeroUI, Tailwind CSS 4, React Router DOM, react-icons/io5 (047-legal-library)
- N/A (client-side calculations only — no persistence) (047-legal-library)
- C# 13 / .NET 9 (Backend), TypeScript 5.x / React 19 + Vite (Admin Dashboard) + ASP.NET Core Web API, EF Core, Redux Toolkit, Axios, HeroUI, Tailwind CSS 4, Recharts (048-ai-usage-tracking)
- SQL Server 2022 (new `AiUsageRecords` table) (048-ai-usage-tracking)
- C# 13 / .NET 9 backend; TypeScript 5.x / React 19 + Vite dashboards; TypeScript / Next.js 16 landing page + ASP.NET Core Web API, ASP.NET Identity, Entity Framework Core, MailKit, `IHttpClientFactory`, FluentValidation, Redux Toolkit, Axios, React Hook Form, Zod (049-secure-otp-recovery)
- SQL Server 2022 via EF Core for users, OTP records, subscriptions, payments, and email failure records (049-secure-otp-recovery)

- Multi-component — .NET 6+ (Backend), TypeScript/React 19 (Dashboards), + Existing project configuration files only: (001-phase0-prerequisites-decisions)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

Multi-component — .NET 6+ (Backend), TypeScript/React 19 (Dashboards),: Follow standard conventions

## Recent Changes
- 049-secure-otp-recovery: Added C# 13 / .NET 9 backend; TypeScript 5.x / React 19 + Vite dashboards; TypeScript / Next.js 16 landing page + ASP.NET Core Web API, ASP.NET Identity, Entity Framework Core, MailKit, `IHttpClientFactory`, FluentValidation, Redux Toolkit, Axios, React Hook Form, Zod
- 048-ai-usage-tracking: Added C# 13 / .NET 9 (Backend), TypeScript 5.x / React 19 + Vite (Admin Dashboard) + ASP.NET Core Web API, EF Core, Redux Toolkit, Axios, HeroUI, Tailwind CSS 4, Recharts
- 047-legal-library: Added TypeScript 5.x / React 19 + Vite + HeroUI, Tailwind CSS 4, React Router DOM, react-icons/io5


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
