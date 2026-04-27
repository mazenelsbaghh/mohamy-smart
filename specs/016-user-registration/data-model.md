# Data Model: User Registration Fields

## Entities

### `User` (or `Lawyer` depending on existing domain models)

Represents a registered user in the Mohamy Smart platform.

**Fields**:
- `Id` (GUID, Primary Key)
- `FullName` (string, required, max length 100)
- `Email` (string, required, unique, max length 256)
- `MobileNumber` (string, required, unique, max length 20)
- `PasswordHash` (string, required)
- `Governorate` (string, required, max length 50)
- `AgreedToTerms` (boolean, required, must be `true` upon registration)
- `CreatedAt` (DateTime, required)
- `UpdatedAt` (DateTime, nullable)

## State Transitions
- **Anonymous -> Registered**: User submits a valid registration form. Account is created and initial Role (`Lawyer` or `User`) is assigned.

## Validation Rules
- `FullName`: Must not be empty.
- `Email`: Must match valid email regex (e.g. `^[^@\s]+@[^@\s]+\.[^@\s]+$`).
- `MobileNumber`: Must be a valid format (e.g. Egyptian local format, regex `^(010|011|012|015)[0-9]{8}$` if restricted to Egypt, or standard generic numeric length).
- `Password`: Must be hashed (bcrypt/argon2 via Identity). Must not be stored in plain text.
- `AgreedToTerms`: API must reject if `false`.
- `Uniqueness`: Before inserting, evaluate `!Db.Users.Any(u => u.Email == Email || u.MobileNumber == MobileNumber)`.
