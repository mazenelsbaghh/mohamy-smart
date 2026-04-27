# Data Model & State Transitions: Phase 1 — Unifying Infrastructure and Shared Library

Since this feature primarily involves refactoring into a monorepo and creating shared UI/Validation libraries, there are no new database entities or backend domain models introduced. 

However, we define the structure of the shared artifacts that the system consumes.

## Validation Schemas (`shared-validations`)

### `auth.ts`
- **LoginSchema**: Validates email (string, email format) and password (string, min 8 chars).
- **RegisterSchema**: Validates name, email, password, and governorate.
- **ForgotPasswordSchema**: Validates email.

### `forms.ts`
- **CaseCreationSchema**: Validates case number, client name, and basic case details.
- **AIAnalysisSchema**: Validates input required for starting an AI workflow.

## Shared UI Components (`shared-ui`)

### Component Props Models

- **`CustomButtonProps`**: Inherits standard HTML button attributes, adds `variant` (primary, secondary, outline, text), `isLoading` (boolean), `icon` (ReactNode).
- **`CustomCardProps`**: Inherits standard HTML div attributes, adds `elevation` (none, sm, md, lg), `hoverable` (boolean) for the standard glass/trust effect.
- **`CustomInputProps`**: Inherits standard HTML input attributes, adds `label` (string), `error` (string), `startContent` (ReactNode), `endContent` (ReactNode).
- **`ContainerProps`**: Enforces the standard `max-w-7xl` layout and padding consistently.
- **`CustomTableProps`**: Accepts `columns` (array of header objects), `data` (array of objects), and `renderCell` (callback for custom cell rendering).
