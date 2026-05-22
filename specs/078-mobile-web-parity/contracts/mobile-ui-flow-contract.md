# Mobile UI Flow Contract

This contract defines the expected mobile destinations and primary user outcomes for parity with the lawyer web dashboard.

## Navigation Destinations

| Destination | Entry | Required Outcome |
|---|---|---|
| Splash | App launch | Decide session route without exposing a blank screen |
| Onboarding | First run | Explain core value and route to login/signup |
| Login | Auth | Authenticate or show actionable failure |
| Sign Up | Auth | Capture lawyer account fields and continue to verification |
| Forgot Password | Auth | Request reset flow and route to verification/reset |
| OTP Verification | Auth | Confirm phone or recovery code |
| Home Dashboard | Main tab | Show urgent work, agenda, active cases, recent AI work, and points |
| Cases List | Main tab | Search/filter/open/create cases |
| Add Case | Cases | Create minimum viable case with full required legal context |
| Case Details | Cases | Manage facts, documents, sessions, client, readiness, and AI actions |
| Document Selection | Case/AI | Select case documents for AI readiness |
| AI Workflow Hub | Case | Show all workflow families, point cost, readiness, versions |
| AI Workflow Runner | AI Hub | Run, pause, resume, review, save, and export workflow output |
| Clients List | Main tab or More | Search/open/create clients |
| Client Details | Clients | Show profile, cases, documents, contact actions, legal relationships |
| Agenda | Main tab | Browse and manage sessions/tasks |
| Documents | More or Case | Upload, scan, process, review, attach, preview states |
| Legal Library | More | Open inheritance, court fees, POA, internal regulations |
| Legal Contracts | More | List/create/open/update/export contracts |
| Process Server Papers | More | List/create/open/update/export papers |
| Chat | More/Home | Send legal assistant messages with optional case context |
| Notifications | Header/More | Read and deep-link activity |
| Subscription and Points | Home/More/AI | Show balance, plan, history, top-up guidance |
| Settings and Profile | More | Update preferences, profile/security actions, sign out |
| System States | Cross-cutting | Loading, empty, error, offline, partial data, permissions |

## Interaction Rules

- Every primary screen must have a clear page title, primary action, loading state, empty state, error state, and retry path.
- Every destructive or chargeable action must request confirmation with clear Arabic copy.
- Every AI workflow step must show selected facts/documents, point cost, run status, and last saved state.
- Every route opened from a case must preserve enough context to return to that case.
- Bottom actions are preferred for mobile primary actions; modals are reserved for blocking confirmations and short forms.
- Long legal outputs must support copy, share/export, and readable typography.
- Arabic text, mixed numbers, and English legal references must not overlap or truncate critical meaning.

## Modern Product UI Rules

- Use a restrained warm-neutral palette with amber only for primary actions, active states, and important status indicators.
- Preserve light and dark parity for every destination.
- Use familiar mobile controls: bottom tabs, segmented controls, tabs, chips, bottom sheets, sticky action bars, and clear icon buttons.
- Avoid decorative motion. Motion must indicate state changes such as loading, saving, tab switch, or completion.
- Cards must not be nested inside other cards.

