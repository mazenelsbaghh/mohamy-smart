# Implementation Tasks: Admin Dashboard API Layer
> **Branch**: `004-admin-dashboard-api-layer`
> Generated via /speckit-tasks

## Dependencies

- **US1 (Axios Instance)**: Blocking prerequisite for API requests.
- **US2 (Redux Store)**: Blocking prerequisite for managing global auth data.
- **US3 (Auth Slice)**: Depends on US1 and US2.
- **US4 (Toast System)**: Independent (can be run parallel to Axios), but practically depends on the login slice to display true backend success messages.

---

## Phase 1: Setup

Goal: Provide the essential software dependencies to construct the frontend features.

- [x] T001 Install dependencies by running `npm i axios @reduxjs/toolkit react-redux react-hot-toast` in the `mohamy-smart-admin-dashboard` directory.

---

## Phase 2: User Story 1 - Axios Instance & HTTP Client
> **Goal**: Pre-configured HTTP client managing authentication tokens correctly headers.
> **Independent Test**: Initiating any API call ensures `import.meta.env.VITE_API_BASE_URL` is leveraged and `localStorage.getItem("admin_accessToken")` is appended perfectly.

- [x] T002 [P] [US1] Create the file `mohamy-smart-admin-dashboard/src/utils/axiosErrorHandler.ts`. It should export a simple helper method `axiosErrorHandler(error: any)` that extracts API errors from Axios responses and returns a clear Arabic error message string (e.g., "حدث خطأ غير متوقع"). 
- [x] T003 [US1] Create the core file `mohamy-smart-admin-dashboard/src/APIs/api.ts` mapping the Axios instance `baseURL` to `import.meta.env.VITE_API_BASE_URL`.
- [x] T004 [US1] Update `mohamy-smart-admin-dashboard/src/APIs/api.ts` to implement a **Request Interceptor**. Fetch `admin_accessToken` from localStorage. If it exists, inject `Authorization: Bearer <token>`. Add `Content-Type: multipart/form-data` if the request data is `FormData`.
- [x] T005 [US1] Update `mohamy-smart-admin-dashboard/src/APIs/api.ts` to implement a **Response Interceptor** for `401 Unauthorized`. It must read `admin_refreshToken` from local storage. Create a `_retry` flag inside the request to prevent infinite loops. If refresh token is available, issue a new POST to `/Auth/refresh-token`, save the new token under `admin_accessToken`, and re-fire the original request.
- [x] T006 [US1] In the `mohamy-smart-admin-dashboard/src/APIs/api.ts` Response Interceptor, if the token refresh method fails, immediately purge `admin_accessToken` and `admin_refreshToken` from local storage and execute a `window.location.replace("/auth/login")` redirection redirect. 

---

## Phase 3: User Story 2 - Redux Store & Provider Wiring
> **Goal**: Establish the structural foundation for Redux without enforcing specific integrations yet.
> **Independent Test**: Redux DevTools displays the store containing `auth`, `lawyers`, `subscriptions`, `plans`, `notifications`, `reports` as slices with `isLoading: false`.

- [x] T007 [P] [US2] Create empty initial state slices: `mohamy-smart-admin-dashboard/src/redux/lawyers/lawyersSlice.ts` containing a default standard interface (`data: [], isLoading: false, error: null`). Export the slice reducer. Repeat identically for `subscriptions`, `plans`, `notifications`, and `reports` slices inside their respective newly created sub-directories in `src/redux/`.
- [x] T008 [US2] Create Redux store initialization inside `mohamy-smart-admin-dashboard/src/redux/store.ts`. Configure the store and assign the placeholder slice reducers mapping to their names (e.g., `lawyers`, `subscriptions`, `plans`, `notifications`, `reports`). Temporarily skip `auth` reducer mapping if it is not yet built. Export `RootState` and `AppDispatch` types.
- [x] T009 [US2] Modify `mohamy-smart-admin-dashboard/src/main.tsx` to import the new `store` object and the `Provider` module from `react-redux`. Wrap the `<AppRouter />` with the standard structural `<Provider store={store}>` component. 

---

## Phase 4: User Story 3 - Auth Slice with Login/Logout Thunks
> **Goal**: Connect user inputs to Redux mapping global JWT capabilities targeting isolated `admin_` prefix tokens.
> **Independent Test**: Firing `thunkAuthLogin` attaches the correct responses, storing them into `admin_accessToken` inside localStorage without touching normal client `accessToken`.

- [x] T010 [P] [US3] Create async thunk action inside `mohamy-smart-admin-dashboard/src/redux/auth/thunk/thunkAuthLogin.ts` named `thunkAuthLogin`. It should accept `{ phone, password }`, construct a `FormData` payload mapping `PhoneNumber` to phone and `Password` to password, and perform a POST query utilizing the Axios `api` instance pointing directly at `/Auth/admin/login`. On error, catch utilizing the previously constructed `axiosErrorHandler`.
- [x] T011 [US3] Create `mohamy-smart-admin-dashboard/src/redux/auth/authSlice.ts`. Initiate a slice taking the `initialState` mapping `admin_accessToken`, user data, loading state, and error. Ensure initial state reads natively from localStorage to keep logins active after a refresh.
- [x] T012 [US3] In `mohamy-smart-admin-dashboard/src/redux/auth/authSlice.ts`, map the `thunkAuthLogin` lifecycle into `extraReducers`. Make sure that `addCase(thunkAuthLogin.fulfilled)` writes `admin_accessToken` and `admin_refreshToken` precisely to localStorage avoiding any Lawyer Dashboard state overlaps. Write `state.user` state securely.
- [x] T013 [US3] Inside `mohamy-smart-admin-dashboard/src/redux/auth/authSlice.ts`, define a synchronous Reducer named `logOut`. It must map state values back to `null` and execute `localStorage.removeItem("admin_accessToken")`, `localStorage.removeItem("admin_refreshToken")`, and `localStorage.removeItem("admin_user")`. Export this action.
- [x] T014 [US3] Complete Redux store combination by injecting the finalized `authSlice` to `mohamy-smart-admin-dashboard/src/redux/store.ts`.

---

## Phase 5: User Story 4 - Toast Notification System
> **Goal**: Provide Arabic feedback using `react-hot-toast` matching current project workflows.
> **Independent Test**: Triggering an intentionally bad login form surfaces a nicely formatted red localized box.

- [x] T015 [P] [US4] Update `mohamy-smart-admin-dashboard/src/main.tsx` to add `<Toaster position="top-right" />` matching the standard layout, exported natively from `react-hot-toast` placing it alongside the application router.
- [x] T016 [US4] Create `mohamy-smart-admin-dashboard/src/utils/toastHelpers.ts` exporting functions `showSuccessToast(msg: string)` and `showErrorToast(msg: string)` wrapping real `toast.success` and `toast.error` methods inside clean Arabic-compatible configurations.
- [x] T017 [US4] Inside typical application operations layer (e.g. `thunkAuthLogin.ts` or inside `authSlice.ts`), trigger `showSuccessToast("تم تسجيل الدخول بنجاح")` correctly whenever login `.fulfilled` executes. Connect `showErrorToast` logically mapping payload error strings from the `.rejected` actions for smooth notifications.
