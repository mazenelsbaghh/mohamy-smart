# Data Model: Clients Management (018)

**Phase**: 1 — Design & Contracts  
**Date**: 2026-04-08

---

## Domain Entities (Backend — Lawyer.Core)

### Client (Modified)

```csharp
// Lawyer.Core/Models/Client.cs
public class Client : BaseEntity<Guid>
{
    public string ClientName { get; set; }      // Required
    public string PhoneNumber { get; set; }     // NEW — Required
    public string Email { get; set; }           // NEW — Optional
    public string Notes { get; set; }           // NEW — Optional

    public Guid LawyerId { get; set; }
    public Lawyer Lawyer { get; set; }

    public Guid? CaseId { get; set; }           // Legacy FK (kept for backward compat)
    public Case Case { get; set; }
}
```

> Note: `CaseId` on `Client` is a legacy one-to-one FK. The canonical direction is `Case.ClientId → Client`. The profile page uses `Case.ClientId` to find all cases for a given client.

---

## DTOs (Backend — Lawyer.Application)

### CreateClientDto (Modified)

```csharp
public class CreateClientDto
{
    public string ClientName { get; set; }   // Required
    public string PhoneNumber { get; set; }  // NEW — Required
    public string Email { get; set; }        // NEW — Optional
    public string Notes { get; set; }        // NEW — Optional
    public Guid? CaseId { get; set; }
}
```

### UpdateClientDto (Modified)

```csharp
public class UpdateClientDto
{
    public string ClientName { get; set; }
    public string PhoneNumber { get; set; }  // NEW
    public string Email { get; set; }        // NEW
    public string Notes { get; set; }        // NEW
    public Guid? CaseId { get; set; }
}
```

### ClientDto (Modified — returned from API)

```csharp
public class ClientDto
{
    public Guid Id { get; set; }
    public string ClientName { get; set; }
    public string PhoneNumber { get; set; }   // NEW
    public string Email { get; set; }         // NEW
    public string Notes { get; set; }         // NEW
    public Guid LawyerId { get; set; }
    public Guid? CaseId { get; set; }
    public DateTime CreationDate { get; set; }
    public List<ClientCaseSummaryDto> Cases { get; set; }  // NEW — for profile view
}
```

### ClientCaseSummaryDto (NEW)

```csharp
public class ClientCaseSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Number { get; set; }
    public string Court { get; set; }
    public CaseStatus Status { get; set; }   // Active / Closed
    public DateTime CreationDate { get; set; }
}
```

---

## Frontend Types (TypeScript)

### TClient (types/types.ts — Modified)

```typescript
export type TClient = {
    id: string;
    clientName: string;
    phoneNumber: string;   // NEW
    email: string | null;  // NEW
    notes: string | null;  // NEW
    lawyerId: string;
    caseId: string | null;
    creationDate: string;
};
```

### TClientDetails (clientsSlice.ts — Modified)

```typescript
type TClientCaseSummary = {
    id: string;
    title: string;
    number: string;
    court: string;
    status: 'Active' | 'Closed';
    creationDate: string;
};

type TClientDetails = {
    id: string;
    clientName: string;
    phoneNumber: string;
    email: string | null;
    notes: string | null;
    lawyerId: string;
    caseId: string | null;
    creationDate: string;
    cases: TClientCaseSummary[];   // NEW
};
```

---

## Redux State Shape (clientsSlice.ts)

```typescript
type TInitialState = {
    clients: TClient[];
    pageNumber: number;
    totalRecords: number;
    totalPages: number;
    clientDetails: TClientDetails | null;
    loading: TLoading;
    updateLoading: TLoading;   // NEW — separate loading for update action
    error: string | null;
};
```

---

## Database Migration

A new EF Core migration is required:

```
Migration name: AddClientContactFields
Changes:
  - ALTER TABLE Clients ADD PhoneNumber NVARCHAR(50) NULL
  - ALTER TABLE Clients ADD Email NVARCHAR(200) NULL  
  - ALTER TABLE Clients ADD Notes NVARCHAR(MAX) NULL
```

Run via: `make db-migrate`

---

## Validation Rules

| Field | Rule |
|-------|------|
| ClientName | Required, max 200 chars |
| PhoneNumber | Required, max 50 chars |
| Email | Optional, valid email format if provided |
| Notes | Optional, max 2000 chars |

---

## Relationships Summary

```
Lawyer (1) ──< Client (many)     [Client.LawyerId FK]
Client (1) ──< Case (many)       [Case.ClientId FK — canonical direction]
Client (1) ─── Case (0 or 1)     [Client.CaseId FK — legacy, kept]
```
