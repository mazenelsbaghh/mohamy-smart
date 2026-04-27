# API Contracts: Lawyer Agenda Roll and Protection Features

## Cancel Power of Attorney

`PUT /api/PowerOfAttorney/{id}/cancel`

Allows marking a POA as canceled.

**Request**
No body needed, just the path variable.

**Response (200 OK)**
```json
{
  "id": "123",
  "isCanceled": true,
  "cancellationDate": "2026-04-08T12:00:00Z",
  "message": "Power of attorney has been canceled successfully."
}
```

## Get Agenda Roll

`GET /api/Sessions/agenda-roll?date={date}&lawyerId={lawyerId}`

Fetches all sessions formatted for the Roll view table.

**Request Query**
- `date` (optional): ISO date string to filter sessions for a specific day.
- `lawyerId` (optional): Filter to sessions assigned to a specific lawyer.

**Response (200 OK)**
```json
[
  {
    "id": "abc-123",
    "sessionDate": "2026-04-09T09:00:00Z",
    "caseId": "xyz-789",
    "caseNumber": "153/2026",
    "courtName": "محكمة القاهرة الجديدة",
    "plaintiffName": "أحمد محمود",
    "defendantName": "شركة المقاولات",
    "previousDecision": "تأجيل للإعلان",
    "assignedLawyerId": "uuid-def-456",
    "assignedLawyerName": "محمد علي"
  }
]
```

## Document Handoff endpoints

`POST /api/Clients/{clientId}/documents/handoff`

Creates a new document handoff record, and allows `multipart/form-data` upload in a single request.

**Form Data**
- `documentName` (string, required)
- `deliveryDate` (string, required)
- `receiptFile` (file, optional)

**Response (201 Created)**
```json
{
  "id": "doc-handoff-001",
  "documentName": "أصل عقد البيع",
  "deliveryDate": "2026-04-08",
  "receiptFilePath": "/uploads/receipts/doc-handoff-001.pdf"
}
```

`GET /api/Clients/{clientId}/documents/handoff`

Returns a list of all handed-off documents for the client.

## Client Financial Transactions

`POST /api/Clients/{clientId}/transactions`

Creates a new transaction for the client.

**Request Body**
```json
{
  "type": "Income", // or "Expense"
  "amount": 1500.00,
  "description": "دفعة أتعاب",
  "transactionDate": "2026-04-08T10:00:00Z"
}
```

**Response (201 Created)**
```json
{
  "id": "tx-123",
  "amount": 1500.00,
  "type": "Income"
  // ...
}
```

`GET /api/Clients/{clientId}/transactions`

Returns a list of all transactions to populate the ledger.
