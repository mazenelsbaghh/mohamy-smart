# Quickstart Guide: Phase 1 — Unifying Infrastructure and Shared Library

Follow these instructions to verify the monorepo setup and shared libraries locally.

### 1. Initial Setup

Navigate to the project root and install all dependencies across the workspace:

```bash
npm install
```

*Note: Since we are using npm workspaces, this single command will resolve and link all dependencies for the apps and shared packages.*

### 2. Verify Turborepo Builds

Ensure that all applications can build successfully using the workspace packages:

```bash
npx turbo run build
```

This will run the `build` script in the `admin-dashboard`, `lawyer-dashboard`, `landing`, and any shared packages concurrently, taking advantage of caching.

### 3. Verify Code Quality

Run the central linting and type checking commands:

```bash
npx turbo run lint
npx turbo run type-check
```

### 4. Running the Development Environment

Start all frontend applications simultaneously in development mode:

```bash
npx turbo run dev
```

- Landing Page will be available at: http://localhost:3000
- Lawyer Dashboard will be available at: http://localhost:5078
- Admin Dashboard will be available at: http://localhost:5079

### 5. Testing Shared UI Changes (HMR)

1. Leave `npx turbo run dev` running.
2. Open `packages/shared-ui/src/components/CustomButton.tsx`.
3. Change the button's background color or padding.
4. Save the file.
5. Observe that the dashboards immediately update via Vite/Next.js Hot Module Replacement, proving the internal package linking is working perfectly.
