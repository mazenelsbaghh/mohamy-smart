# API Contracts: Sessions and Actions Agenda

## 1. Create Agenda Item
`POST /api/Agenda`

**Request Body (Session):**
```json
{
  "caseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Title String",
  "date": "2026-04-08T00:00:00Z",
  "type": "Session",
  "sessionType": "First Hearing",
  "courtName": "Predefined Court Name",
  "previousSessionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Optional
  "postponementReason": "Predefined Reason" // Required if previousSessionId is provided
}
```

**Request Body (Action):**
```json
{
  "caseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Title String",
  "date": "2026-04-08T00:00:00Z",
  "type": "Action",
  "actionType": "Inspection",
  "executionDetails": "Predefined detail text",
  "location": "Optional Location"
}
```

**Response (201 Created):**
```json
{
  "id": "3fa85f64...",
  "caseId": "3fa85f64...",
  "title": "Title String",
  "date": "2026-04-08T00:00:00Z",
  "type": "...",
  "status": "Scheduled"
}
```

## 2. Get Agenda List
`GET /api/Agenda/case/{caseId}`

**Response (200 OK):**
```json
[
  {
    "id": "3fa85f64...",
    "caseId": "3fa85f64...",
    "title": "Title String",
    "date": "2026-04-08T00:00:00Z",
    "type": "Session",
    "status": "Scheduled",
    "sessionType": "...",
    "courtName": "...",
    "previousSessionId": null,
    "postponementReason": null
  },
  {
    "id": "abc...",
    "type": "Action",
    "actionType": "...",
    "executionDetails": "..."
    // ... basic base fields included
  }
]
```
