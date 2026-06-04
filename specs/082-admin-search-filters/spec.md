# Feature Specification: Admin Search Filters

**Feature Branch**: `082-admin-search-filters`  
**Created**: 2026-06-04  
**Status**: Draft  
**Input**: User description: "ضفلي شريط بحث في الادمن لكل المحامي و كل الصفحات علشان اقدر اعمل سيرش و اعمل فلاتر لكل حاجه في الادمن في كل الصفحات علشان اعرف اشوف"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Find Lawyers Quickly (Priority: P1)

As an admin, I can search and filter the lawyers list by name, office, bar number, specialization, subscription, and active status so I can find the exact lawyer record without paging manually.

**Why this priority**: The lawyers page is the primary operational admin list and currently requires manual scanning.

**Independent Test**: Open admin lawyers, type a lawyer name or bar number, apply status/subscription filters, and verify the table shows only matching lawyers from the full dataset, not only the current page.

**Acceptance Scenarios**:

1. **Given** the lawyers page has many records, **When** the admin searches by a lawyer name, **Then** the list reloads with matching records and pagination resets to page 1.
2. **Given** the lawyers page is filtered to inactive lawyers, **When** the admin clears filters, **Then** the unfiltered lawyers list returns and pagination remains usable.

---

### User Story 2 - Filter Admin Lists Consistently (Priority: P2)

As an admin, I can use the same compact RTL filter toolbar on admin list pages so search and filters feel predictable across contacts, reviews, subscriptions, notifications, AI usage, and security reports.

**Why this priority**: Several pages already have one-off filters or no filters, which slows operations and creates inconsistent UI.

**Independent Test**: Open each updated admin list page and verify the toolbar search/filter controls narrow visible results without breaking existing actions.

**Acceptance Scenarios**:

1. **Given** a page has local records loaded, **When** the admin enters a search term, **Then** only matching visible records remain.
2. **Given** a page has status/type filters, **When** the admin combines search and filters, **Then** the empty state clearly says no matching records were found if no item matches.

---

### User Story 3 - Clear Filters and See Counts (Priority: P3)

As an admin, I can see how many records match the current filters and clear all active filters in one action.

**Why this priority**: Counts and clear actions prevent hidden filter confusion during repeated admin work.

**Independent Test**: Apply any search/filter on an updated page and verify the result count changes and the clear button resets the page.

**Acceptance Scenarios**:

1. **Given** active filters are applied, **When** the admin presses clear, **Then** all filter fields reset and the full result set is visible.
2. **Given** the search text is empty and filters are default, **When** the toolbar renders, **Then** the clear button is not visually prominent or is disabled.

### Edge Cases

- Search terms with leading/trailing whitespace are trimmed before filtering or sending to the API.
- Arabic and English text are matched case-insensitively where casing applies.
- Empty datasets keep the existing empty/error states and do not show misleading match counts.
- Server-side lawyers search must not accept unbounded page sizes.
- Filters must work on mobile without overlapping table content or page actions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The lawyers page MUST provide a search field and filters for active status and subscription type.
- **FR-002**: Lawyers search MUST query the full lawyers dataset through the existing paginated API rather than filtering only the current page.
- **FR-003**: Lawyers filtering MUST reset pagination to page 1 whenever search text or filter values change.
- **FR-004**: Admin list pages with loaded datasets MUST use a consistent reusable toolbar for search, filters, result count, and reset behavior.
- **FR-005**: The toolbar MUST support RTL Arabic labels, keyboard input, and mobile wrapping.
- **FR-006**: Updated pages MUST preserve existing row/card actions such as status updates, mark read, delete, edit, archive, and navigation.
- **FR-007**: Search/filter empty states MUST explicitly distinguish "no data" from "no matching records".
- **FR-008**: Backend user search parameters MUST be optional, sanitized by trimming, and bounded to existing pagination limits.

### Key Entities *(include if feature involves data)*

- **Admin Filter State**: Search text plus optional status/type/plan fields used by each admin page.
- **Lawyer Search Query**: Server query parameters for user type, pagination, search term, active status, and subscription activity.
- **Filtered Admin Result Set**: The subset of currently loaded local records matching toolbar state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can find a lawyer by name, office, specialization, email, phone, or bar number in under 10 seconds on a dataset requiring multiple pages.
- **SC-002**: At least six admin list/report pages expose a consistent search/filter toolbar.
- **SC-003**: Applying or clearing filters never requires a full browser refresh.
- **SC-004**: Toolbar controls remain usable at 550px, 1000px, 1100px, and desktop widths without text overlap.

## Assumptions

- "شريط بخق" is interpreted as "شريط بحث" (search bar).
- "كل الصفحات" means major admin list/report pages, not static legal/auth pages or settings forms.
- Lawyers require server-side search because the table is paginated by the backend.
- Existing authorization, routing, and API base URL behavior remain unchanged.
