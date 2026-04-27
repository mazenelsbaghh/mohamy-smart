# Phase 0: Research & Technical Context

## React Router Authentication Guards
**Decision**: Utilize grouping wrapper layout components (`AdminRoute` and `PublicRoute`) wrapping `<Outlet />` inside the `react-router-dom` v6 setup.
**Rationale**: By structuring layout components over `react-router-dom` trees, all child pages implicitly inherit the security guard evaluations. This completely centralizes authentication logic and mitigates the risk of developers forgetting to add security rules when introducing future pages.
**Alternatives considered**: High-Order Component wrapping applied to each individual Page component. Rejected because it violates DRY (Don't Repeat Yourself) mechanics and exponentially increases the effort needed to maintain the routing hierarchy.

## JWT Role Validation Logic
**Decision**: The routing Guards will inspect `authSlice`'s `isAuthenticated` flag and the `roles` array in the `TAdminUser` user schema rather than decoding the JWT payload inside the component.
**Rationale**: `authSlice` from Phase 3 natively builds an integrated user context upon login. Re-decoding the JWT string within React Router triggers unnecessary evaluations and adds external `jwt-decode` dependencies.
