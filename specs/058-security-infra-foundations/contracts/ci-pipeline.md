# CI Workflow Contract: Security & Infrastructure Foundations

**Feature**: `058-security-infra-foundations`  
**Date**: 2026-04-22

## Contract: Enhanced CI Pipeline

### Trigger
- `push` to `main` or `develop`
- `pull_request` targeting `main` or `develop`

### Frontend Job Contract (applies to all 3 apps)

Each frontend job MUST execute the following steps in order:

| Step | Command | Failure Behavior |
|------|---------|------------------|
| 1. Checkout | `actions/checkout@v4` | Job fails |
| 2. Setup Node | `actions/setup-node@v4` (node 22) | Job fails |
| 3. Install | `npm ci` | Job fails |
| 4. Lint | `npm run lint` | Job fails — lint violations reported |
| 5. Type Check | `npx tsc --noEmit` | Job fails — type errors reported |
| 6. Build | `npm run build` | Job fails — build errors reported |
| 7. Security Audit | `npm audit --production --audit-level=high` | Job fails — vulnerabilities reported |

### Backend Job Contract (unchanged)

| Step | Command | Failure Behavior |
|------|---------|------------------|
| 1. Checkout | `actions/checkout@v4` | Job fails |
| 2. Setup .NET | `actions/setup-dotnet@v4` (.NET 9.0) | Job fails |
| 3. Restore | `dotnet restore Lawyer.sln` | Job fails |
| 4. Build | `dotnet build Lawyer.sln -c Release --no-restore` | Job fails |
| 5. Test | `dotnet test Lawyer.sln -c Release --no-build` | Job fails |

### PR Merge Eligibility

A PR is eligible for merge ONLY when ALL jobs pass (backend + all 3 frontends).

---

## Contract: Dependabot Configuration

### Monitored Ecosystems

| Ecosystem | Directory | Schedule | PR Limit |
|-----------|-----------|----------|----------|
| npm | `/mohamy-smart-admin-dashboard` | Weekly | 5 |
| npm | `/mohamy-smart-lawyer-dashboard` | Weekly | 5 |
| npm | `/mohamy-smart-landing` | Weekly | 5 |
| nuget | `/mohamy-smart-backend` | Weekly | 5 |
| github-actions | `/` | Weekly | 3 |

### Dependabot PR Format
- Title: `Bump <package> from <old> to <new> in /<directory>`
- Labels: `dependencies`
- Auto-merge: Not configured (manual review required)

---

## Contract: HTTPS Guard

### Behavior Matrix

| Environment | URL Protocol | Behavior |
|-------------|-------------|----------|
| Production | `https://` | ✅ Allow — proceed normally |
| Production | `http://` | ❌ Reject — throw Error + console.warn |
| Development | `https://` | ✅ Allow |
| Development | `http://` (localhost) | ✅ Allow |

### Error Message Format
```
[Security] {ENV_VAR_NAME} must use HTTPS in production. Got: {actual_url}
```
