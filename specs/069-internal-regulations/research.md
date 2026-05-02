# Research: Internal Regulations in Legal Library

## Decision: Model internal regulations as lawyer-owned legal library records

**Rationale**: The current legal library in the lawyer dashboard is a first-level navigation area, and existing user-owned legal artifacts such as legal contracts and powers of attorney are managed through authenticated lawyer APIs. Lawyer-owned records allow each lawyer to maintain their own internal regulations without introducing admin-only global content management in this slice.

**Alternatives considered**: A global admin-managed legal-source catalog was considered, but it would require admin dashboard workflows and permissions not requested by this feature. A free-text field on cases was rejected because it would not create reusable legal library content.

## Decision: Use an explicit case-to-internal-regulation link entity

**Rationale**: A join entity prevents duplicate links, supports multiple regulations per case, preserves historical associations, and keeps deletion/archive behavior separate from case data. It also keeps future audit metadata possible without redesigning the relationship.

**Alternatives considered**: Storing selected regulation IDs as JSON on `Case` would be faster to add but weaker for querying, uniqueness, and referential integrity. Duplicating regulation text only on the case would lose the library relationship.

## Decision: Maintain a case-level internal regulation context string for existing AI workflows

**Rationale**: Existing workflow services already call `AnalysisHelpers.BuildCaseContext(Case, caseTypeName)` from many paths. Adding a denormalized `InternalRegulationsContext` on `Case` lets all current workflow paths include linked regulations once `BuildCaseContext` appends that field. The case service and regulation service rebuild this context when links or regulation content/status change.

**Alternatives considered**: Updating every workflow query to eagerly load nested regulation links would be broader and riskier. Lazy loading is not enabled and should not be introduced.

## Decision: Archive internal regulations instead of hard delete

**Rationale**: Legal work needs historical review. Archiving prevents new selection while keeping old links and audit context available. The service can exclude archived regulations from active selection and rebuild affected case contexts.

**Alternatives considered**: Hard deletion was rejected because it could remove legal context from previous case work.

## Decision: Keep the first implementation in the lawyer dashboard

**Rationale**: The user request targets the lawyer-facing legal library and case work. The dashboard already has protected lawyer routes and form patterns for legal artifacts.

**Alternatives considered**: Adding admin dashboard management was deferred because it expands permissions and operations beyond the described workflow.
