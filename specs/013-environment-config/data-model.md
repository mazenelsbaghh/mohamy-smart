# Data Model: Environment Variable Strategy

## Runtime Profile

**Description**: A named operating context that determines which environment values are required and how they are interpreted.

**Fields**:
- `name`: Human-readable profile name such as local development or production deployment
- `purpose`: Why the profile exists and who uses it
- `trackedTemplatePath`: The committed template file associated with the profile
- `secretInjectionPath`: The untracked file or deployment mechanism used for real values
- `requiredValueGroups`: The categories of configuration required for this profile
- `optionalValueGroups`: The categories of configuration allowed to remain unset

**Relationships**:
- A runtime profile owns one or more environment templates.
- A runtime profile references one public endpoint set.

**Validation Rules**:
- Each runtime profile must have exactly one tracked template for its primary configuration surface.
- Each runtime profile must distinguish required values from optional values.

## Environment Template

**Description**: A tracked file that documents configuration keys and placeholder values for a specific profile or application surface.

**Fields**:
- `path`: Repository path to the template
- `owner`: Team or component responsible for keeping the template accurate
- `scope`: Infrastructure-wide, backend, or app-specific
- `variableSet`: The keys documented by the template
- `containsSecrets`: Whether the live counterpart is expected to store secret values
- `usageMode`: Runtime-loaded or build-time-injected

**Relationships**:
- An environment template belongs to one runtime profile or one application surface within that profile.
- An environment template contains many configuration variables.

**Validation Rules**:
- Tracked templates must only contain placeholders or safe defaults.
- Templates must not duplicate ownership of the same secret across unrelated files.

## Configuration Variable

**Description**: A single named setting that configures application behavior, connectivity, or third-party integrations.

**Fields**:
- `key`: Canonical environment variable name
- `category`: Authentication, data access, AI, payment, email, monitoring, routing, or infrastructure
- `sensitivity`: Secret, internal, or public
- `requirednessByProfile`: Whether the variable is required or optional in each runtime profile
- `consumer`: Backend, specific frontend app, Docker orchestration, or shared infrastructure
- `description`: Plain-language explanation of what the variable controls

**Relationships**:
- A configuration variable may appear in one or more templates.
- A configuration variable may be grouped into a public endpoint set.

**Validation Rules**:
- Key naming must follow the conventions expected by the consuming runtime.
- Secret variables must never appear with real values in tracked templates.

## Public Endpoint Set

**Description**: The group of externally visible application and callback URLs that must stay coordinated for a given profile.

**Fields**:
- `backendUrl`
- `lawyerDashboardUrl`
- `adminDashboardUrl`
- `landingUrl`
- `callbackBaseUrl`
- `corsOrigins`

**Relationships**:
- A public endpoint set is associated with one runtime profile.
- A public endpoint set constrains multiple configuration variables.

**Validation Rules**:
- Public URLs must align with canonical ports locally and deployed domains in production.
- Callback and CORS values must remain consistent with backend and frontend addresses.
