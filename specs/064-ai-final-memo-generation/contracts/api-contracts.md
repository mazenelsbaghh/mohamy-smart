# API Contracts: AI-Powered Final Defense Memorandum Generation

**Feature**: 064-ai-final-memo-generation  
**Date**: 2026-04-24

## Modified Endpoint

### POST /api/cases/{caseId}/ai-jobs

**Existing endpoint** — no URL change. Extended to handle `DefenseMemoDraft` step type.

**Request Body** (unchanged structure):
```json
{
    "stepType": "DefenseMemoDraft",
    "inputJson": "{...serialized DefenseMemoDraftRequestDto...}"
}
```

**inputJson contents** (DefenseMemoDraftRequestDto serialized):
```json
{
    "caseId": "guid",
    "caseNumber": "string",
    "caseType": "string", 
    "courtName": "string",
    "clientName": "string",
    "apponentName": "string",
    "defendingParty": "client | opponent",
    "legalFactsSummary": ["string"],
    "defendantsPositions": [
        {
            "defendantName": "string",
            "relationshipToClient": "string",
            "positionSummary": "string"
        }
    ],
    "approvedDefenses": [
        {
            "defenseTitle": "string",
            "basisFromCase": "string",
            "type": "Formal | Substantive | Evidentiary",
            "explanation": {
                "introduction": "string",
                "factualBasis": "string",
                "legalTexts": [
                    {
                        "lawName": "string",
                        "articleNumber": "string",
                        "fullText": "string"
                    }
                ],
                "linkingTextsToFacts": "string",
                "cassationPrecedents": [
                    {
                        "appealNumber": "string",
                        "judicialYear": "string",
                        "sessionDate": "string",
                        "fullText": "string"
                    }
                ],
                "legalApplication": "string",
                "counterArguments": "string",
                "legalEffectOfAcceptance": "string"
            }
        }
    ],
    "finalRequests": [
        {
            "requestLevel": "أصلي | احتياطي | احتياطي كلي",
            "requestText": "string"
        }
    ]
}
```

**Response** (unchanged structure):
```json
{
    "succeeded": true,
    "data": {
        "id": "guid",
        "caseId": "guid",
        "stepType": "DefenseMemoDraft",
        "status": "Queued",
        "resultJson": null,
        "errorMessage": null,
        "createdAt": "2026-04-24T12:00:00Z",
        "completedAt": null
    }
}
```

## Job Completion (via SignalR)

When the AI job completes, `resultJson` contains:
```json
{
    "memoHtml": "<p>بسم الله الرحمن الرحيم</p><p>...</p>..."
}
```

The `memoHtml` field contains the complete HTML document suitable for rendering in a content-editable div and conversion to DOCX.

## Existing Endpoint (No Changes)

### POST /api/cases/{caseId}/smart-analysis/save-draft

Used to auto-save lawyer edits on the AI-generated memo. No changes needed — already works with `stepNumber: 5`.

### GET /api/cases/{caseId}/smart-analysis/summary

Already returns `defenseMemoDraft` field from the AiJob table. No changes needed.

## Admin Endpoint (No Changes)

### GET /api/admin/ai-model-config
### PUT /api/admin/ai-model-config

Both already work dynamically based on `PipelineRegistry.GetAllIncludedStages()`. Adding `DefenseMemoDraft` to the registry automatically makes it appear.
