# Phase 1: Data Model & State Architecture

*(Since this feature focuses strictly on application routing logic, true entities maps do not apply — instead, mapping structural Route dependencies.)*

## Structural Component Hierarchy

```tsx
// Application Router Tree Topology

AppRouter
│
├── PublicRoute (Guards against authenticated sessions returning to Login)
│   └── /auth/login
│
└── AdminRoute (Secures the layout by confirming token and 'Admin' role via Redux Auth State)
    ├── / (Dashboard Home)
    ├── /lawyers
    ├── /subscriptions
    ├── /plans
    ├── /notifications
    └── /settings
```

## Security Interface Contract

- **`AdminRoute` Evaluation Protocol**:
  - Requires `auth.isAuthenticated === true`
  - Requires `auth.user.roles.includes("Admin")`
  - Fails: Issues `<Navigate to="/auth/login" replace />`
- **`PublicRoute` Evaluation Protocol**:
  - Requires `auth.isAuthenticated === false`
  - Fails: Issues `<Navigate to="/" replace />`
