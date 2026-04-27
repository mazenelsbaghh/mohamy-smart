# Research: Phase 1 — Unifying Infrastructure and Shared Library

## Monorepo Tooling
- **Decision**: Use `npm workspaces` alongside `Turborepo`.
- **Rationale**: The project currently relies on `package-lock.json`, `npm ci`, and `npm audit` heavily in its GitHub Actions pipeline (established in Phase 0). Switching to `pnpm workspaces` would require a complete overhaul of the CI/CD pipeline, Dockerfiles, and developer environments. `npm workspaces` combined with `Turborepo` provides the desired monorepo orchestration and caching without the overhead of changing the package manager.
- **Alternatives considered**: `pnpm workspaces` (great but disruptive), `Nx` (overly complex for just 3 frontend apps and 2 packages).

## Shared UI Technology
- **Decision**: Internal TypeScript packages consumed directly by Vite/Next.js.
- **Rationale**: Setting up a full build pipeline (e.g., Rollup, tsup) for internal packages introduces friction during development. By exporting raw TypeScript and configuring the consuming apps (Vite/Next.js) to transpile the local packages, developers get instant HMR (Hot Module Replacement) and a seamless experience.
- **Alternatives considered**: Building the shared UI package as a pre-compiled ESM module (slower dev loop, complex Tailwind config).

## Tailwind CSS Configuration for Monorepo
- **Decision**: Shared Tailwind CSS classes with absolute path scanning in the consuming apps.
- **Rationale**: Tailwind v4 simplifies configuration. The consuming applications (Admin, Lawyer, Landing) just need to include the `packages/shared-ui/src/**/*.{ts,tsx}` in their content scanning paths to ensure the shared UI styles are generated correctly in the final bundle.
- **Alternatives considered**: A centralized Tailwind config package (more complex to setup for Vite and Next.js mixing).
