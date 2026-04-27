# Phase 0 Research

## Decision: Secret Management Strategy
**Decision**: Use Environment Variables and/or Azure Key Vault in production. Local development will use `.env.docker` and `appsettings.Development.json`.
**Rationale**: Constitution explicitly lists this under the `SECRETS_STRATEGY` resolved decision.
**Alternatives considered**: Doppler, AWS Secrets Manager (rejected to align with the existing project constitution).

## Decision: Git History Cleaning Tool
**Decision**: Use `git filter-repo`.
**Rationale**: It is the modern recommended approach by Git and is faster and safer than `git filter-branch` or BFG for removing sensitive files from all branches.
**Alternatives considered**: BFG Repo Cleaner.
