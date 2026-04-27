# API Contracts: AI Jobs

**Phase**: 1 — Design  
**Date**: 2026-04-08  
**Branch**: `017-persist-ai-job-state`  
**Base URL**: `http://localhost:8976/api` (local) · `https://api.mohamy-smart.com/api` (production)  
**Auth**: All endpoints require `Authorization: Bearer <jwt>` with role `Lawyer`

---

## REST Endpoints

### GET /cases/{caseId}/ai-jobs

Returns all AI job statuses for a case. Used on page load to restore state.

**Parameters**:
- `caseId` (path, int, required) — the case ID

**Response 200**:
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "caseId": 42,
    "stepType": "FactAnalysis",
    "status": "completed",
    "resultJson": "{\"caseType\":\"...\",\"legalFactsSummary\":[...]}",
    "errorMessage": null,
    "createdAt": "2026-04-08T10:00:00Z",
    "completedAt": "2026-04-08T10:00:45Z"
  },
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "caseId": 42,
    "stepType": "GenerateDefenses",
    "status": "queued",
    "resultJson": null,
    "errorMessage": null,
    "createdAt": "2026-04-08T10:01:00Z",
    "completedAt": null
  }
]
```

**Response 404**: Case not found  
**Response 401**: Unauthorized

---

### POST /cases/{caseId}/ai-jobs

Submits a new AI job for a step. Idempotent — returns existing job if already queued or processing.

**Parameters**:
- `caseId` (path, int, required)

**Request body**:
```json
{
  "stepType": "FactAnalysis",
  "inputJson": "{\"facts\":\"...\",\"caseNumber\":\"2024/123\"}"
}
```

`stepType` valid values: `FactAnalysis`, `GenerateDefenses`, `AnalysisDefense`, `FinalRequirements`, `LawsuitCaseType`, `LawsuitParties`, `LawsuitSubjects`, `LawsuitFacts`, `LawsuitLegalBasis`, `LawsuitRequests`, `Ocr`

`inputJson` is step-specific. Its shape matches the existing POST request bodies already used in the respective thunks.

**Response 202** (Accepted — new job enqueued):
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "caseId": 42,
  "stepType": "FactAnalysis",
  "status": "queued",
  "resultJson": null,
  "errorMessage": null,
  "createdAt": "2026-04-08T10:00:00Z",
  "completedAt": null
}
```

**Response 200** (OK — existing active job returned, no duplicate created):
```json
{ /* same shape as above, status = "queued" or "processing" */ }
```

**Response 400**: Invalid stepType or missing required input  
**Response 404**: Case not found  
**Response 401**: Unauthorized

---

### POST /cases/{caseId}/ai-jobs/{stepType}/retry

Retries a failed job. Creates a new job record (previous failed record is archived).

**Parameters**:
- `caseId` (path, int, required)
- `stepType` (path, string, required)

**Request body**: Same as POST `/cases/{caseId}/ai-jobs` (re-sends the input)

**Response 202**: New job enqueued (same shape as above)  
**Response 409**: Job is not in `failed` state — cannot retry  
**Response 404**: Case or step job not found  
**Response 401**: Unauthorized

---

### GET /cases/{caseId}/ai-jobs/{stepType}

Returns the status and result for a single step. Used for polling fallback.

**Response 200**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "caseId": 42,
  "stepType": "FactAnalysis",
  "status": "completed",
  "resultJson": "{...}",
  "errorMessage": null,
  "createdAt": "2026-04-08T10:00:00Z",
  "completedAt": "2026-04-08T10:00:45Z"
}
```

**Response 404**: No job found for this case + step combination  
**Response 401**: Unauthorized

---

## SignalR Hub

**Endpoint**: `ws://localhost:8976/hubs/ai-jobs`  
**Auth**: JWT token passed as query parameter `?access_token=<token>`  
**Client group**: Each connected client joins group `case-{caseId}` on connect

### Client → Server messages

| Method | Payload | Description |
|--------|---------|-------------|
| `JoinCase` | `{ caseId: number }` | Join the SignalR group for a specific case to receive its job updates |
| `LeaveCase` | `{ caseId: number }` | Leave the case group (on component unmount) |

### Server → Client messages

| Method | Payload | Description |
|--------|---------|-------------|
| `JobStatusChanged` | `AiJobStatusDto` | Fired when a job transitions state (Queued→Processing, Processing→Completed/Failed) |
| `JobCompleted` | `AiJobStatusDto` | Fired specifically when a job reaches `Completed` — includes `resultJson` |
| `JobFailed` | `AiJobStatusDto` | Fired specifically when a job reaches `Failed` — includes `errorMessage` |

**AiJobStatusDto shape** (same as REST response):
```json
{
  "id": "string (uuid)",
  "caseId": "number",
  "stepType": "string",
  "status": "queued | processing | completed | failed",
  "resultJson": "string | null",
  "errorMessage": "string | null",
  "createdAt": "ISO 8601 UTC",
  "completedAt": "ISO 8601 UTC | null"
}
```

---

## Frontend Integration Pattern

```typescript
// 1. On case page mount — restore all completed results
dispatch(thunkGetAllAiJobs({ caseId }));

// 2. Connect to SignalR hub
const connection = new HubConnectionBuilder()
    .withUrl(`${VITE_API_BASE_URL.replace('/api', '')}/hubs/ai-jobs`, {
        accessTokenFactory: () => getToken()
    })
    .withAutomaticReconnect()
    .build();

connection.on('JobStatusChanged', (job: AiJob) => {
    dispatch(aiJobsSlice.actions.upsertJob(job));
    if (job.status === 'completed' && job.resultJson) {
        dispatch(restoreResultFromJob(job)); // dispatches into existing slice
    }
});

await connection.start();
await connection.invoke('JoinCase', { caseId });

// 3. On unmount
await connection.invoke('LeaveCase', { caseId });
await connection.stop();
```

---

## Polling Fallback

If SignalR connection fails (WebSocket blocked), the frontend falls back to polling `GET /cases/{caseId}/ai-jobs/{stepType}` every 3 seconds for any job in `queued` or `processing` state. Polling stops when the job reaches a terminal state (`completed` or `failed`).
