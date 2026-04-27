# mohamy smart Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-11

## Active Technologies
- TypeScript / React 19 / Vite + react-router-dom, react-redux, Redux Toolki (005-admin-auth-guards)
- Redux State (`user.roles`), localStorage (`admin_accessToken`) (005-admin-auth-guards)
- TypeScript / React 19 / Vite + React-Redux, Redux Toolkit, Axios, @heroui/react (for UI Components) (006-admin-api-integration)
- Redux State (Hydrated datasets for lawyers, plans, analytics) (006-admin-api-integration)
- C# / .NET 6+ Web API + Entity Framework Core, ASP.NET Core, JWT Authentication (007-backend-endpoints-fixes)
- SQL Server (relational) (007-backend-endpoints-fixes)
- C# (.NET 9), TypeScript (React 19 / Next.js 16) + ASP.NET Core Web API, Entity Framework Core, ASP.NET Identity, React Hook Form, Zod, HeroUI, Axios (016-user-registration)
- SQL Server 2022 (016-user-registration)
- C# / .NET 9 (Backend), TypeScript / React 19 (Dashboards), TypeScript / Next.js 16 (Landing) + ASP.NET Core MVC, Entity Framework Core, React Hook Form, Zod, HeroUI, Tailwind CSS 4, Axios (016-user-registration)
- SQL Server 2022 (Docker container locally) (016-user-registration)
- C# / .NET 9 Web API + ASP.NET Core, Entity Framework Core, System.Text.Json (031-shared-backend-utilities)
- N/A (Business Logic refactoring) (031-shared-backend-utilities)
- C# 13 / .NET 9 + ASP.NET Core, `System.Text.Json` (033-unified-parsing)
- SQL Server 2022 (via EF Core, used conceptually to store the raw JSON strings that we're validating). (033-unified-parsing)
- TypeScript / React 19 + Vite + Redux Toolkit, Axios, React Hook Form, Zod, HeroUI, Tailwind CSS 4, react-hot-toas (034-frontend-shared-hooks)
- Redux State, no persistent storage modifications in this feature. (034-frontend-shared-hooks)
- N/A (In-memory Redux store only) (035-frontend-redux-unification)

- TypeScript / React 19 / Vite + Axios, Redux Toolkit, react-redux, react-hot-toast, @heroui/reac (004-admin-dashboard-api-layer)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript / React 19 / Vite: Follow standard conventions

## Recent Changes
- 035-frontend-redux-unification: Added TypeScript / React 19 + Vite + Redux Toolkit, Axios, Reac
- 034-frontend-shared-hooks: Added TypeScript / React 19 + Vite + Redux Toolkit, Axios, React Hook Form, Zod, HeroUI, Tailwind CSS 4, react-hot-toas


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
