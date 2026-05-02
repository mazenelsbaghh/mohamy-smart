# Quickstart: Internal Regulations in Legal Library

## Backend

1. Apply the EF migration that adds internal regulation tables and case context fields.
2. Start the backend on the existing canonical port `8976`.
3. Authenticate as a lawyer.
4. Create an internal regulation:

```http
POST /api/v1/InternalRegulations
Content-Type: application/json

{
  "title": "اللائحة الداخلية للشركة",
  "regulationNumber": "IR-2026",
  "issuingAuthority": "إدارة الشركة",
  "summary": "تنظيم إجراءات العمل الداخلية",
  "content": "النص الكامل للائحة الداخلية..."
}
```

5. Link it to a case:

```http
PUT /api/v1/Case/{caseId}/internal-regulations
Content-Type: application/json

{
  "internalRegulationIds": ["{internalRegulationId}"]
}
```

6. Fetch the case and confirm the linked regulation appears in `internalRegulations`.

## Lawyer Dashboard

1. Open `/legal-library`.
2. Open "اللوائح الداخلية".
3. Add a regulation with title and content.
4. Open an existing case, review "المراجع القانونية", and link the regulation.
5. Start an analysis workflow and confirm the case context includes both the selected case/law type and the internal regulation content.

## Regression Checks

- A case without internal regulations still opens and starts analysis normally.
- Archived regulations disappear from active case selection.
- Removing a regulation from a case does not delete it from the legal library.
- Duplicate selected regulations are ignored or rejected with an Arabic validation message.
