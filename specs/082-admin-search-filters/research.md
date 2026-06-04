# Research: Admin Search Filters

## Decision: Server-side lawyers search

**Rationale**: The lawyers page is paginated by `/Account/users`; local filtering would only search the current page and violate the user goal. Adding optional query parameters preserves pagination and existing API response shape.

**Alternatives considered**: Fetch all lawyers client-side. Rejected because it increases payload size and bypasses existing bounded pagination.

## Decision: Local filtering for already-loaded admin lists

**Rationale**: Contacts, reviews, notifications, reports, plans, and AI usage tables already load the relevant page-level datasets. Local filtering avoids unnecessary backend scope expansion and keeps the feature small.

**Alternatives considered**: Add search parameters to every endpoint. Rejected because the request is UI-wide discovery, and backend expansion would be disproportionate for loaded summary/report widgets.

## Decision: Reusable admin toolbar component

**Rationale**: Existing filters are inconsistent. One toolbar standardizes search, select filters, counts, reset behavior, RTL layout, and dark mode token usage.

**Alternatives considered**: Keep page-specific filters. Rejected because it duplicates UX and code patterns.
