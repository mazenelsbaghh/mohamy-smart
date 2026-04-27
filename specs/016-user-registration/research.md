# Research Log: User Registration Fields

## Decision 1: UX Host Location

- **Decision**: Registration UI will be hosted in `mohamy-smart-landing` (Next.js), redirecting to the `mohamy-smart-lawyer-dashboard` (React) upon successful authentication.
- **Rationale**: Landing pages typically host public-facing acquisition flows (marketing + signup). The dashboard is an authenticated SPA application protected by auth guards. Housing the signup in the landing Next.js app provides better SEO (if we make the auth pages indexable or share components) and faster initial load, while preserving the Dashboard as purely an authenticated experience.
- **Alternatives considered**: Housing signup in `mohamy-smart-lawyer-dashboard`. Rejected because it mixes public and private routing logic extensively.

## Decision 2: Identity Implementation

- **Decision**: Extend ASP.NET Core Identity (or the existing custom JWT auth implementation in `mohamy-smart-backend`) to persist the new fields (Mobile Number, Governorate) along with standard Email/Password authentication.
- **Rationale**: ASP.NET Core Identity is robust and widely adopted. The project already mentions JWT (+ Refresh Tokens) in the constitution. Modifying the existing user entity inside `Lawyer.Core` is straightforward.
- **Alternatives considered**: A fully custom User table and password hasher. Usually inferior to built-in Identity providers unless the current architecture strictly mandates it.

## Decision 3: Uniqueness Verification

- **Decision**: Perform uniqueness checks natively via Entity Framework (`AnyAsync()`) in the Registration Service / Command Handler before issuing an insert.
- **Rationale**: Best practice to catch duplicates before DB exception (though a DB unique index is also added as a hard constraint). Email and Mobile Number must both be checked. 
- **Alternatives considered**: Relying solely on SQL `UNIQUE` constraints and catching `DbUpdateException`. Rejected due to bad performance and harder targeted error localization for Arabic UI mapping.
