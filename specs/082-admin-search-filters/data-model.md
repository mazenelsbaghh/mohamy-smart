# Data Model: Admin Search Filters

## AdminFilterToolbar Props

- `searchValue`: current search text.
- `onSearchChange`: callback for text changes.
- `searchPlaceholder`: Arabic placeholder for the page.
- `filters`: optional select controls with `key`, `label`, `value`, `options`, and `onChange`.
- `totalCount`: total records available in the current scope.
- `filteredCount`: records matching current filters.
- `onReset`: callback to clear all filters.
- `isFiltering`: whether any filter/search value is active.

## Lawyer Search Query

- `userType`: existing admin user type filter.
- `pageNumber`: existing page number.
- `pageSize`: existing bounded page size.
- `search`: optional trimmed text matched against lawyer/user fields.
- `isActive`: optional active/inactive user status.
- `subscriptionIsActive`: optional active/inactive subscription status.

## Local Filter State

- `searchQuery`: current text.
- `statusFilter`, `typeFilter`, `planFilter`: page-specific string values.
- Filtered result is derived in render using normalized searchable text.

## Validation Rules

- Empty strings are equivalent to no filter.
- Search values are trimmed.
- Page size remains clamped by backend defaults.
- Filter option labels are Arabic.
