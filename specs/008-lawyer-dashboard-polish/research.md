# Phase 0: Outline & Research

## Decision 1: Session recovery must use a single refresh queue

- **Decision**: Replace the current naive 401 retry behavior with a guarded refresh flow built around a single in-flight refresh operation, a pending-request queue, and an explicit exclusion for the refresh endpoint itself.
- **Rationale**: The current interceptor retries each 401 independently and can recurse when the refresh call itself fails. A queue-based approach resolves concurrent 401s once, prevents duplicate retries, and guarantees a single logout path when refresh cannot succeed.
- **Alternatives considered**: Immediate logout on every 401 without refresh support (too disruptive for active lawyers), per-request retry flags only (still vulnerable to concurrent refresh races and loop-like failure behavior).

## Decision 2: Settings should use dedicated self-service profile contracts

- **Decision**: Treat lawyer settings as a self-service capability and add explicit authenticated lawyer profile endpoints for `GET /api/account/profile` and `PUT /api/account/profile`, while keeping password changes on `PUT /api/account/change-password`.
- **Rationale**: The current `AccountController` only exposes admin-oriented user management plus change-password. Reusing admin user endpoints for lawyer self-service would blur authorization boundaries and force the frontend to know about admin-centric resource shapes.
- **Alternatives considered**: Reusing `GET /api/account/users/{id}` for self-service access (authorization ambiguity and incorrect contract ownership), moving profile reads to the auth payload only (insufficient for editable settings and refresh after updates).

## Decision 3: Subscription activation remains payment-first

- **Decision**: The Lawyer Dashboard subscription purchase flow will use the existing payment-first sequence: load plans, load current lawyer subscription, initiate payment via `POST /api/payment/initiate`, present the payment URL or embedded experience, then refresh visible subscription state using payment status and the lawyer subscription endpoint.
- **Rationale**: The backend already contains a `PaymentController`, `PaymobService`, payment status endpoints, and a note that direct subscription activation is admin-only. The frontend should stop dispatching a direct “subscribe now” activation as the primary lawyer flow.
- **Alternatives considered**: Calling `POST /api/subscription` directly from the lawyer dashboard (conflicts with the backend’s payment-first intent and admin-only restriction), treating payment as purely external and asking the user to refresh later without status polling (poor UX and weaker observability).

## Decision 4: Documents and legal contracts need dedicated lawyer-facing read surfaces

- **Decision**: This phase will expose dedicated lawyer-facing read contracts for documents and legal contracts instead of leaving those pages backed by local arrays or upload-only state. The documents contract should aggregate uploaded and OCR-derived records tied to the lawyer’s work, and the legal contracts contract should provide either real contract records or an explicit unsupported/empty response for the lawyer context.
- **Rationale**: The current `Documents` page only handles local uploads plus OCR and does not persist or list previously available records. The `LegalContracts` page is entirely static. API-first compliance requires a real backend-backed listing or a deliberate unsupported-state contract.
- **Alternatives considered**: Keeping page-local mock data until a later phase (violates Principle II), overloading unrelated case endpoints without a dedicated lawyer-facing page contract (weak discoverability and higher coupling).

## Decision 5: AI chat should be a dedicated conversational contract, not a reuse of case-analysis actions

- **Decision**: Add a dedicated authenticated lawyer chat endpoint such as `POST /api/smartanalysis/chat` returning a conversational response payload, while keeping existing case-analysis endpoints intact for structured case workflows.
- **Rationale**: The current `SmartAnalysisController` supports case analysis, defenses, and summaries, but not free-form chat. Reusing those endpoints for generic chat would create mismatched request/response semantics and complicate quota handling.
- **Alternatives considered**: Hardcoding a “welcome” or echo response in the frontend (violates API-first and provides no value), forcing the chat page to masquerade as a case-analysis page (poor UX and weak contract clarity).

## Decision 6: Explicit UI states are part of the feature contract

- **Decision**: Every affected page in this phase will support a resolved UI state model of `loading`, `success`, `empty`, `unsupported`, and `error`, with Arabic-first messaging.
- **Rationale**: The feature spec requires removal of broken placeholders and silent failures. Treating these states as contract-level requirements keeps frontend and backend behavior aligned and measurable.
- **Alternatives considered**: Ad hoc conditional rendering per page (inconsistent UX), redirecting users away from unsupported pages without explanation (reduces trust and discoverability).

*All technical unknowns for this phase have been resolved well enough to proceed to design and task generation.*
