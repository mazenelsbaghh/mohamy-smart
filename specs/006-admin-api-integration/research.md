# Phase 0: Research & Technical Context

## Pagination Component Architecture
**Decision**: Leverage the `@heroui/react` native `Pagination` component paired tightly to a local React state `const [page, setPage] = useState(1)`, which consecutively fires a Redux `useDispatch` upon change.
**Rationale**: Keeps UI reactivity fast and localizes pagination offset logic, whilst deferring the complex caching and HTTP transaction logic purely to the Redux Slices set up in Phase 3.
**Alternatives considered**: Storing the pagination offset as URL Query Parameters (`?page=2`) via `react-router-dom`. Rejected because internal administrative UI generally does not heavily prioritize shareable URL deep links across simple ledger lists.

## Data Fetching Topology
**Decision**: Standardize all API-hydrate queries to activate within a `useEffect` hook bound intimately to the top-level Page layout component (e.g., `LawyersList.tsx`) rather than within individual list items.
**Rationale**: Initiating the API connection at the root view ensures data cascades gracefully downward as Props (or context via `useSelector`), circumventing redundant overlapping network calls.
