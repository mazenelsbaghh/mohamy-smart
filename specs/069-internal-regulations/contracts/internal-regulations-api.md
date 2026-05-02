# API Contract: Internal Regulations

Base path uses existing API versioning: `/api/v1`.

## GET `/InternalRegulations`

List the current lawyer's internal regulations.

**Query**

- `search` (string, optional): Matches title, number, authority, summary, or content.
- `includeArchived` (bool, optional, default `false`): Include inactive records.
- `pageNumber` (int, optional, default `1`)
- `pageSize` (int, optional, default `10`)

**Response 200**

```json
{
  "succeeded": true,
  "data": {
    "data": [
      {
        "id": "11111111-1111-1111-1111-111111111111",
        "title": "اللائحة الداخلية للشركة",
        "regulationNumber": "IR-2026",
        "issuingAuthority": "إدارة الشركة",
        "summary": "تنظيم إجراءات العمل الداخلية",
        "content": "النص الكامل للائحة...",
        "isActive": true,
        "createdAtUtc": "2026-05-02T10:00:00Z",
        "updatedAtUtc": null
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalRecords": 1,
    "totalPages": 1
  }
}
```

## POST `/InternalRegulations`

Create an internal regulation for the current lawyer.

**Request**

```json
{
  "title": "اللائحة الداخلية للشركة",
  "regulationNumber": "IR-2026",
  "issuingAuthority": "إدارة الشركة",
  "summary": "تنظيم إجراءات العمل الداخلية",
  "content": "النص الكامل للائحة..."
}
```

**Validation**

- `title` required, max 240.
- `content` required, max 50000.
- Optional string fields must respect max lengths.

## PUT `/InternalRegulations/{id}`

Update an internal regulation owned by the current lawyer.

**Request**

```json
{
  "title": "اللائحة الداخلية المحدثة",
  "regulationNumber": "IR-2026",
  "issuingAuthority": "إدارة الشركة",
  "summary": "ملخص محدث",
  "content": "النص الكامل المحدث...",
  "isActive": true
}
```

## PATCH `/InternalRegulations/{id}/archive`

Archive the current lawyer's internal regulation. Archived records are not selectable for new case links.

## PATCH `/InternalRegulations/{id}/restore`

Restore an archived internal regulation.

## PUT `/Case/{caseId}/internal-regulations`

Replace the current lawyer's selected internal regulations for a case.

**Request**

```json
{
  "internalRegulationIds": [
    "11111111-1111-1111-1111-111111111111"
  ]
}
```

**Behavior**

- Requires the case to belong to the requesting lawyer.
- Rejects inactive or non-owned regulations.
- Removes links omitted from the request.
- Prevents duplicate links.
- Rebuilds the case's internal regulation context for analysis.

**Response 200**

Returns the updated `CaseDto`, including:

```json
{
  "internalRegulations": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "title": "اللائحة الداخلية للشركة",
      "regulationNumber": "IR-2026",
      "issuingAuthority": "إدارة الشركة",
      "isActive": true
    }
  ]
}
```
