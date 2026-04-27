# Quickstart: Clients Management (018)

**Branch**: `018-clients-management`  
**Date**: 2026-04-08

---

## Prerequisites

- Backend running on port 8976
- Lawyer Dashboard running on port 5078
- SQL Server running (Docker container)
- Auth token valid (lawyer logged in)

---

## Setup & Migration

```bash
# 1. Ensure Docker stack is up
make dev

# 2. After adding new Client fields, apply migration
make db-migrate
```

---

## What's Being Built

| Area | What Changes |
|------|-------------|
| **Backend** | Add `PhoneNumber`, `Email`, `Notes` to `Client` entity + DTOs + migration |
| **Backend** | Include `cases[]` list in `ClientDto` (returned from `GetByIdAsync`) |
| **Frontend** | `Clients.tsx` — add card/table toggle + search bar |
| **Frontend** | `ClientDetails.tsx` — full profile redesign (avatar, data, cases section, edit mode) |
| **Frontend** | `thunkUpdateClient` — new thunk for PUT /Client/{id} |
| **Frontend** | `thunkAddNewClient` — add `phoneNumber`, `email`, `notes` params |
| **Frontend** | `clientsSlice.ts` — update types, add `updateLoading` |
| **Frontend** | `types/types.ts` — extend `TClient` with new fields |
| **Frontend** | `Clients.css` — extend with table view styles + profile styles |

---

## Implementation Order

```
1. Backend: Extend Client entity → DTOs → migration
2. Backend: Update ClientService to include Cases in GetById response
3. Frontend: Update TClient type
4. Frontend: Update clientsSlice (new type fields + updateLoading)
5. Frontend: Add thunkUpdateClient
6. Frontend: Update thunkAddNewClient (add phone/email/notes)
7. Frontend: Redesign Clients.tsx (card + table toggle + search)
8. Frontend: Redesign ClientDetails.tsx (full profile)
9. Frontend: Update CSS/styles
```

---

## Testing Checklist

- [ ] Cards appear with name, phone, date, case badge
- [ ] Toggle between card and table view works
- [ ] Search filters cards/table rows in real-time
- [ ] Clicking card/row navigates to `/clients/:id`
- [ ] Profile shows all fields + avatar initials
- [ ] Profile cases section lists all linked cases
- [ ] Edit mode opens form pre-filled with correct data
- [ ] Save edit calls PUT `/Client/{id}` and updates UI
- [ ] Add new client (with phone) creates correctly
- [ ] Empty state shows when no clients
- [ ] Pagination works for both views

---

## Key File Paths

```text
Backend:
  Lawyer.Core/Models/Client.cs
  Lawyer.Application/Dtos/Client/ClientDto.cs
  Lawyer.Application/Services/ClientService.cs
  Lawyer.Infrastracture/Migrations/

Frontend:
  src/types/types.ts
  src/redux/clients/clientsSlice.ts
  src/redux/clients/thunk/thunkUpdateClient.ts        [NEW]
  src/redux/clients/thunk/thunkAddNewClient.ts        [MODIFY]
  src/redux/clients/thunk/thunkGetClientDetails.ts    [no change needed]
  src/pages/clients/Clients.tsx                       [REDESIGN]
  src/pages/clients/ClientDetails.tsx                 [REDESIGN]
  src/pages/clients/Clients.css                       [EXTEND]
```
