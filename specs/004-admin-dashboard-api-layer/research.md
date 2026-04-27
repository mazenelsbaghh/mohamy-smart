# Phase 0: Research & Technical Context

## Authentication Session Isolation
**Decision**: The Admin Dashboard will use distinct localStorage keys for authorization: `admin_accessToken` and `admin_refreshToken`.
**Rationale**: As both the Admin Dashboard and Lawyer Dashboard run on the same environment (localhost in development, same domain/subdomain locally), they share `localStorage`. Prefixing the keys ensures that parallel sessions can operate independently without token overwrites or triggering unintended cross-app logouts.
**Alternatives considered**: HttpOnly Cookies. While safer, the current backend implementation uses JWTs directly on the client side via Authorization headers, and refactoring to HttpOnly cookies is out of scope for this task and potentially violates Phase Phase 0 architecture constraints unless amended in the Constitution.

## Redux Topology
**Decision**: Setting up a structured Redux store with empty slices (`auth`, `lawyers`, `subscriptions`, `plans`, `notifications`, `reports`).
**Rationale**: Establishing global state foundations from day one provides a consistent structure and allows immediate integration of Auth APIs (like login and logout token management) without requiring a future refactor.
**Alternatives considered**: React Context API. The Lawyer Dashboard uses Redux Toolkit; utilizing Redux ensures architectural consistency across frontend applications.

## Axios Interceptor 401 Handling
**Decision**: Clone the Lawyer Dashboard Axios interceptor 401 retry-logic but tailor it for the admin token keys (`admin_accessToken`, `admin_refreshToken`).
**Rationale**: Proven code pattern that protects against infinite retry loops and handles JWT expiration gracefully.
