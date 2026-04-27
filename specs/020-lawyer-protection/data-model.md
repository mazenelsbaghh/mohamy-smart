# Data Model: Lawyer Agenda Roll and Protection Features

## Entities and Relationships

### 1. Session (Existing, to be verified)
- **Modifications**: Ensure it has fields mapping to:
  - `SessionDate` (DateTime)
  - `CaseId` (Foreign Key to Case - provides Case Number, Court, Parties)
  - `PreviousDecision` (String/Text) - the decision rendered at the previous session, or we look it up sequentially.
  - `AssignedLawyerId` (Guid/String, FK to IdentityUser/Lawyer)

### 2. PowerOfAttorney (Existing)
- **Modifications**:
  - `IsCanceled` (Boolean) - Default `false`. Indicates if the POA has been legally revoked.
  - `CancellationDate` (DateTime, Nullable) - Represents when it was marked canceled.

### 3. DocumentHandoff (New)
- **Purpose**: Records the return of original documents to the client.
- **Fields**:
  - `Id` (Guid/Int, PK)
  - `ClientId` (Guid/Int, FK to Client)
  - `DocumentName` (String, required) - Description of the document (e.g., "Original contract").
  - `DeliveryDate` (DateTime) - When the document was physically handed over.
  - `ReceiptFilePath` (String, Nullable) - Server path/URL to the uploaded receipt/signature image.
  - `CreatedAt` (DateTime)

### 4. ClientTransaction (New)
- **Purpose**: Records financial ledger items (income/expenses) for a client profile.
- **Fields**:
  - `Id` (Guid/Int, PK)
  - `ClientId` (Guid/Int, FK to Client)
  - `Type` (Enum: `Income` | `Expense`) - Whether it's money received or money paid out for court fees.
  - `Amount` (Decimal) - Financial amount.
  - `Description` (String, required) - Explanation for the transaction.
  - `TransactionDate` (DateTime)
  - `CreatedAt` (DateTime)

## Validation Rules
- **PowerOfAttorney**:
  - If `IsCanceled == true`, it cannot be linked to any new Case. The API must check `!poa.IsCanceled` before successful case creation/linking.
- **DocumentHandoff**:
  - `DocumentName` and `DeliveryDate` are mandatory.
  - Uploaded files must be validated (e.g., only PDF, JPEG, PNG) and limited to a reasonable size (e.g., 10MB).
- **ClientTransaction**:
  - `Amount` must be greater than 0.
  - `Description` is mandatory for auditability.
