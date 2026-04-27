# Research: Clients Management (018)

**Phase**: 0 — Outline & Research  
**Date**: 2026-04-08

---

## 1. Existing Clients Infrastructure (Current State)

### Decision: Build on top of the existing clients layer — don't rebuild from scratch.

**Rationale**: The project already has a working clients foundation:

| Layer | Existing Asset | Status |
|-------|---------------|---------|
| Backend | `ClientController.cs` — CRUD endpoints (GET, POST, PUT, DELETE) | ✅ Complete |
| Backend | `IClientService` + `Client` entity with `ClientName`, `LawyerId`, `CaseId`, `CreationDate` | ✅ Complete |
| Backend | `ClientDto`, `CreateClientDto`, `UpdateClientDto` | ✅ Complete |
| Frontend | `clientsSlice.ts` — Redux state with `clients[]`, `clientDetails`, pagination, loading | ✅ Complete |
| Frontend | `thunkGetAllClients`, `thunkGetClientDetails`, `thunkAddNewClient` | ✅ Complete |
| Frontend | `Clients.tsx` + `ClientDetails.tsx` pages + `Clients.css` | ✅ Partial (needs upgrade) |
| Router | `/clients` and `/clients/:id` routes exist | ✅ Complete |

**Gap Analysis**:
- `Clients.tsx` shows cards-only view — **missing table/list view toggle**
- `ClientDetails.tsx` is a basic read-only form — **missing profile design, no cases section**
- No "cases belonging to this client" endpoint — only `caseId` (one-to-one on Client entity) but `Case` entity has `ClientId` (one-to-many from Case side)
- `ClientDto` lacks phone/email/notes fields — **backend enhancement needed if we want richer client data**

---

## 2. Data Model Gap: Client Entity Fields

### Decision: Add `PhoneNumber`, `Email`, `Notes` fields to the `Client` entity.

**Rationale**: Current `Client` model only has `ClientName`, `LawyerId`, `CaseId`. The spec requires phone, email, notes for the profile. This means:
1. Adding fields to `Client.cs` (Core)
2. Adding fields to `ClientDto`, `CreateClientDto`, `UpdateClientDto` (Application)
3. EF Core migration required

**Alternatives considered**:
- Store contact info only on the Case — rejected (client can exist without a case)
- Use the `ApplicationUser` model — rejected (clients are not system users)

---

## 3. Client-to-Cases Relationship

### Decision: Expose cases for a client via a new endpoint `GET /Client/{id}/cases`.

**Rationale**: Current data model allows a Case to have a `ClientId` (nullable FK to Client). The `IClientService.GetByIdAsync` doesn't currently return cases. We need either:
- **Option A**: Add `cases` collection to `ClientDto` returned by `GetByIdAsync` — simplest, one call
- **Option B**: Separate `GET /Client/{id}/cases` endpoint — cleaner separation

**Decision**: Option A — include cases directly in `GetByIdById` response to avoid extra round-trips in the profile page. Add `Cases` list to `ClientDto`.

---

## 4. View Toggling Pattern (Card ↔ Table)

### Decision: Client-side toggle via `useState` — single API response, re-rendered in two layouts.

**Rationale**: Data is already pagination-fetched from Redux. Toggling between Card and Table view is purely presentational. No additional API call needed.  
Pattern: `const [viewMode, setViewMode] = useState<'card' | 'table'>('card')`

---

## 5. Update Client Thunk

### Decision: Add `thunkUpdateClient` thunk to support inline editing from the profile page.

**Rationale**: `PUT /Client/{id}` endpoint exists on backend. Frontend thunk is missing. Profile page needs edit functionality per spec.

---

## 6. Search Filtering

### Decision: Client-side search filtering on the `clients` array in Redux state.

**Rationale**: Given pagination (12 per page), client-side search on the current page is acceptable. Server-side search can be added later if the list grows large.

**Alternative considered**: Add `?search=` query param to backend — rejected for V1 to keep scope tight.

---

## 7. Avatar Generation

### Decision: Use CSS-based initials avatar (first 2 chars of `clientName`) — no external library.

**Rationale**: Clients have no profile image in current data model. A simple CSS avatar with background color derived from string hash is lightweight and requires no backend change.

---

## 8. Constitution Check Summary

| Principle | Status |
|-----------|--------|
| I. Security-First | ✅ No new secrets; all API calls through existing Axios interceptor |
| II. API-First Integration | ✅ All data from API; no hardcoded client data |
| III. Role-Based Authorization | ✅ Routes behind existing `ProtectedRoute`; backend lawyer-scoped |
| IV. Clean Architecture | ✅ New fields follow existing layer structure |
| V. Port Consistency | ✅ No port changes |
| VI. Arabic-First UX | ✅ Full RTL; all labels in Arabic; Tajawal font |
| VII. Docker Consistency | ✅ EF migration via `make db-migrate`; no Dockerfile changes |
