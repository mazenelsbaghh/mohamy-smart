# Research: Environment Variable Strategy

## Decision 1: Treat root Docker env templates as the canonical repository-level source for backend and deployment configuration

**Decision**: Use tracked root-level Docker environment templates as the primary canonical source for infrastructure-facing configuration, while preserving app-level frontend examples for application-specific build-time variables.

**Rationale**: The repository already contains `.env.docker.example` and `.env.docker.prod.example` at the root, and these files cover shared runtime concerns such as database connectivity, JWT, AI providers, Paymob, CORS, email, Sentry, and public application URLs. This makes the root the right ownership boundary for infrastructure and cross-application settings.

**Alternatives considered**:
- Use only per-application `.env.example` files. Rejected because shared settings such as CORS origins, backend URLs, and secrets would fragment across apps.
- Move all configuration to backend-only files. Rejected because frontend build-time values and Docker orchestration need their own explicit contract.

## Decision 2: Keep frontend example files limited to public build-time values

**Decision**: Frontend app-level `.env.example` files should only document public, build-time values needed by each app, such as API base URLs and optional monitoring DSNs, rather than duplicating secret-bearing backend settings.

**Rationale**: The current dashboard example files already follow this pattern by exposing only `VITE_*` values. This keeps secret-bearing settings out of frontend ownership and reduces duplication.

**Alternatives considered**:
- Duplicate all backend-related values into each dashboard template. Rejected because it increases drift risk and confuses ownership.
- Eliminate app-level env examples entirely. Rejected because frontend build-time values still need a clear per-app entry point.

## Decision 3: Standardize naming around framework-native environment binding conventions

**Decision**: Preserve framework-native naming conventions for environment variables, including nested backend keys using double underscores and frontend public keys using app-specific public prefixes.

**Rationale**: Existing files already rely on these conventions and they match how the active stack resolves environment values. Keeping them stable minimizes migration risk and prevents mismatches between templates and runtime behavior.

**Alternatives considered**:
- Rename all keys into a custom repository-wide naming style. Rejected because it would add migration cost and break existing configuration expectations.
- Mix multiple naming patterns within the same profile. Rejected because it would weaken predictability and onboarding clarity.

## Decision 4: Separate local and production profiles by intent, not just by values

**Decision**: Maintain distinct local and production templates with different expectations for defaults, public URLs, and requiredness rather than treating production as a copy of local values.

**Rationale**: The local profile optimizes for developer onboarding and can tolerate optional integrations, while the production profile must clearly expose release-critical URLs, credentials, and deployment-specific addresses. This separation is already reflected in the repository and should remain explicit.

**Alternatives considered**:
- Use one universal template for all environments. Rejected because it obscures which values are safe defaults versus release-critical configuration.
- Infer production values from local templates during deployment. Rejected because operators need an explicit production contract.

## Decision 5: Enforce secret safety through tracked examples plus ignored real-value files

**Decision**: Keep tracked example templates in version control and require real-value runtime files to remain ignored by Git.

**Rationale**: This aligns with the constitution’s security-first requirement and the current `.gitignore` behavior, which already excludes `.env*` and environment-specific backend files containing real values.

**Alternatives considered**:
- Commit encrypted secret files. Rejected because it adds operational complexity beyond this feature’s scope.
- Avoid tracked templates and rely on out-of-band setup instructions. Rejected because it harms onboarding and increases support burden.
