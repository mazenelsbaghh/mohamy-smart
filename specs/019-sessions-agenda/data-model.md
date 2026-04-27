# Data Model: Sessions and Actions Agenda

## Backend Entities (Lawyer.Core & EF Core TPH)

### `AgendaItem` (Base Entity)
- `Id` (Guid, PK)
- `CaseId` (Guid, FK to Case)
- `Title` (string)
- `Date` (DateTimeOffset)
- `Status` (enum: Scheduled, Completed, Postponed, Cancelled)
- `CreatedAt` (DateTimeOffset)

### `SessionAgendaItem` (inherits AgendaItem)
- `SessionType` (enum/string: First Hearing, Pleading, Verdict, etc.)
- `CourtName` (string - from a predefined list)
- `PreviousSessionId` (Guid?, nullable FK to another AgendaItem)
- `PostponementReason` (string? - from a predefined list, conditionally required if PreviousSessionId is set)

### `ActionAgendaItem` (inherits AgendaItem)
- `ActionType` (enum: Inspection, Execution)
- `ExecutionDetails` (string - from predefined list based on ActionType)
- `Location` (string?)

## Frontend State (Redux Toolkit / TypeScript Models)

```typescript
export type AgendaStatus = 'Scheduled' | 'Completed' | 'Postponed' | 'Cancelled';

export interface BaseAgendaItem {
  id: string;
  caseId: string;
  title: string;
  date: string;
  status: AgendaStatus;
}

export interface SessionAgendaItem extends BaseAgendaItem {
  type: 'Session';
  sessionType: string;
  courtName: string;
  previousSessionId?: string;
  postponementReason?: string;
}

export interface ActionAgendaItem extends BaseAgendaItem {
  type: 'Action';
  actionType: 'Inspection' | 'Execution';
  executionDetails: string;
  location?: string;
}

export type AgendaItem = SessionAgendaItem | ActionAgendaItem;
```
