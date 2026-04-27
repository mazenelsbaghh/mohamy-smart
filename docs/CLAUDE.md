# mohamy smart Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-10

## Active Technologies
- .NET 9 (Backend) · React 19 + TypeScript (Lawyer Dashboard) + Hangfire (job queue, SQL Server backing) · SignalR (real-time push) · System.Text.Json (result serialization) · Redux Toolkit (frontend state) · Axios (HTTP) (017-persist-ai-job-state)
- SQL Server 2022 — two new tables (`AiJobs`, `HangfireSchema`) via EF Core migration (017-persist-ai-job-state)
- .NET 9 (Backend) · React 19 + TypeScript (Lawyer Dashboard) + Gemini via `AIProviderFactory`, EF Core 9, Redux Toolkit, Axios (023-admin-complaints)
- SQL Server 2022 — new `AdminComplaintWorkflows` table via EF Core migration (023-admin-complaints)

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
- 023-admin-complaints: Added .NET 9 (Backend) · React 19 + TypeScript (Lawyer Dashboard) + Gemini via `AIProviderFactory`, EF Core 9, Redux Toolkit, Axios
- 017-persist-ai-job-state: Added .NET 9 (Backend) · React 19 + TypeScript (Lawyer Dashboard) + Hangfire (job queue, SQL Server backing) · SignalR (real-time push) · System.Text.Json (result serialization) · Redux Toolkit (frontend state) · Axios (HTTP)
- 007-backend-endpoints-fixes: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]


<!-- MANUAL ADDITIONS START -->

## Design Context

> Full details in `.impeccable.md`. This is the summary for quick reference.

### Users
Both **admin users** (platform management, lawyer oversight, subscriptions) and **lawyer users** (cases, calendar, documents, client requests) are equally important. Arabic-speaking legal professionals in the MENA region. Mobile usage is significant.

### Brand Personality
**راقي، أنيق، دقيق** — Refined, Elegant, Precise.
The platform handles high-stakes legal work. Users must feel *in control* and *trusted*. Professional without being cold.

### Aesthetic Direction
Premium legal-tech — not generic SaaS, not corporate enterprise. Restrained and warm. Orange `#EF950A` + cream `#FBFAE8` on a warm off-white background. Tajawal font exclusively. Full RTL. Dark mode receives equal polish to light mode.

**Avoid:** Generic legal platform aesthetics (heavy blues, cluttered tables, serif fonts). Avoid sterile enterprise SaaS look. Avoid anything that reads as "a template."

### Design Principles
1. **Precision over decoration** — every visual choice must have a purpose
2. **Both audiences, same quality** — no secondary screens
3. **RTL-native, not RTL-adapted** — Arabic-first layout and flow
4. **Dark mode parity** — test and ship both modes equally
5. **Mobile is first-class** — not a compressed desktop version

### Key Tokens
- Primary: `#EF950A` | Secondary bg: `#FBFAE8` | Page bg: `#F0EEE7`
- Text: `#1B1B1B` / `#1B1B1BA6` | Success: `#34BF49` | Danger: `#CA0000`
- Radius: `16px` (sm) / `24px` (lg) | Padding: `24px` | Transition: `0.4s`
- Font: Tajawal (200–900) | Direction: RTL | Accessibility: WCAG AA minimum

<!-- MANUAL ADDITIONS END -->
