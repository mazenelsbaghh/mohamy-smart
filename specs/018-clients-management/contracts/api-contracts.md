# API Contracts: Clients Management (018)

**Phase**: 1 — Design & Contracts  
**Date**: 2026-04-08  
**Base URL**: `http://localhost:8976/api`  
**Auth**: Bearer JWT required on all endpoints

---

## Modified Endpoints

### GET /Client

Retrieve paginated clients for a lawyer.

**Query Parameters**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| pageNumber | int | No | Default: 1 |
| pageSize | int | No | Default: 10 |
| lawyerId | Guid | No | Filter by lawyer |

**Response** (unchanged structure, enriched DTO):
```json
{
  "succeeded": true,
  "data": {
    "data": [
      {
        "id": "3fa85f64-...",
        "clientName": "محمد أحمد علي",
        "phoneNumber": "01012345678",
        "email": "client@example.com",
        "notes": null,
        "lawyerId": "...",
        "caseId": null,
        "creationDate": "2026-01-15T00:00:00"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalRecords": 45,
    "totalPages": 5
  }
}
```

---

### GET /Client/{id}

Get client details including related cases.

**Path Parameters**: `id` — Client GUID

**Response** (enriched with `cases` array):
```json
{
  "succeeded": true,
  "data": {
    "id": "3fa85f64-...",
    "clientName": "محمد أحمد علي",
    "phoneNumber": "01012345678",
    "email": "client@example.com",
    "notes": "موكل مميز — معه عدة قضايا نشطة",
    "lawyerId": "...",
    "caseId": null,
    "creationDate": "2026-01-15T00:00:00",
    "cases": [
      {
        "id": "...",
        "title": "قضية ميراث عائلة علي",
        "number": "2026/1234",
        "court": "محكمة الأسرة",
        "status": "Active",
        "creationDate": "2026-02-01T00:00:00"
      }
    ]
  }
}
```

---

### POST /Client/create

Create a new client.

**Request** (Query params per existing controller binding):
| Param | Type | Required |
|-------|------|----------|
| ClientName | string | ✅ |
| PhoneNumber | string | ✅ NEW |
| Email | string | ❌ |
| Notes | string | ❌ |
| CaseId | Guid | ❌ |

**Response**: Created `ClientDto`

---

### PUT /Client/{id}

Update client fields.

**Path Parameters**: `id` — Client GUID  
**Request** (Query params): same as CreateClientDto

**Response**: Updated `ClientDto`

---

## Frontend Service Layer (Axios Thunks)

### Existing (no changes needed)
- `thunkGetAllClients` — `GET /Client` ✅
- `thunkGetClientDetails` — `GET /Client/{id}` ✅ (response will now include `cases`)
- `thunkAddNewClient` — `POST /Client/create` (needs `phoneNumber` added)

### New
- `thunkUpdateClient` — `PUT /Client/{id}`

```typescript
// thunkUpdateClient signature
type TUpdateClientProps = {
    clientId: string;
    clientName: string;
    phoneNumber: string;
    email?: string;
    notes?: string;
    caseId?: string | null;
}
```

---

## Frontend View State

```typescript
// In Clients.tsx
type ViewMode = 'card' | 'table';
const [viewMode, setViewMode] = useState<ViewMode>('card');
const [searchQuery, setSearchQuery] = useState('');

// Derived filtered list
const filteredClients = clients.filter(c =>
    c.clientName.includes(searchQuery) ||
    c.phoneNumber.includes(searchQuery)
);
```

---

## Error Handling

All thunks use the existing `axiosErrorHandler` utility and `rejectWithValue`. Toast notifications via `react-hot-toast` following the pattern established in other features.

| Scenario | User Feedback |
|----------|---------------|
| Create success | Toast: "تم إضافة الموكل بنجاح" |
| Create failure | Toast: server error message |
| Update success | Toast: "تم تحديث بيانات الموكل" |
| Load failure | Toast: "حدث خطأ أثناء تحميل بيانات الموكلين" |
