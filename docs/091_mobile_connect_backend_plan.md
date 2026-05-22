# Plan - Mobile Backend Integration

We will connect the Flutter mobile application (`mohamy_smart_mobile`) to the C# backend APIs instead of relying solely on the local simulated mock/in-memory data. 

The app must maintain an offline-first/fallback design: if the backend is unreachable or an API call fails (due to timeouts, connection refused, or invalid environment), it should catch the error and seamlessly load mock data.

---

## 1. Mapped Backend API Routes

- **Authentication**:
  - `POST api/v1/Auth/login` (Form-Url-Encoded with `PhoneNumber` and `Password`) -> Returns `AuthResponseDto` (JSON body containing `AccessToken`, `RefreshToken`, and user metadata).
  - `POST api/v1/Auth/logout` -> Standard logout.
- **Cases**:
  - `GET api/v1/Case` -> Returns list of cases.
  - `POST api/v1/Case/create` (JSON body mapping `CreateCaseDto`) -> Creates a case.
- **Clients**:
  - `GET api/v1/Client` -> Returns list of clients.
  - `POST api/v1/Client/create` (JSON body mapping `CreateClientDto`) -> Creates a client.
- **Internal Regulations**:
  - `GET api/v1/InternalRegulations` -> Returns list of regulations.
  - `POST api/v1/InternalRegulations` -> Creates a regulation.
  - `PUT api/v1/InternalRegulations/{id}` -> Updates a regulation.
  - `PATCH api/v1/InternalRegulations/{id}/archive` -> Archives a regulation.
- **Power of Attorney**:
  - `GET api/v1/PowerOfAttorney/mine` -> Returns lawyer's POAs.
  - `PUT api/v1/PowerOfAttorney/{id}/cancel` -> Cancels POA.
- **AI Chat Assistant**:
  - `POST api/v1/SmartAnalysis/chat` -> Sends chat messages.

---

## 2. Proposed Implementation Steps

### A. Create ApiService (`api_service.dart`)
- A helper class using standard `dart:io`'s `HttpClient` to communicate with the C# backend.
- Automatically handles base URLs depending on platform:
  - Android emulator: `http://10.0.2.2:8976`
  - iOS emulator/Chrome: `http://localhost:8976`
- Manages authorization tokens:
  - If a JWT token is stored, automatically sets `Authorization: Bearer <token>` in the request headers.
- Implements CRUD wrappers for Cases, Clients, Regulations, POAs, and Chat.

### B. Update AppState (`app_state.dart`)
- Initialize `ApiService`.
- Update `login` method to call the live API, parse credentials, store the `accessToken` in memory, and triggers:
  - Connecting SignalR (passing the bearer token).
  - Fetching live cases, clients, regulations, and POAs.
- Wrap all backend API requests in `try/catch`. On error (network timeout or connection refused), log the error and fall back to `DemoLegalRepository` mock data so the app remains fully operational offline.
- Update UI mutation events (like `addCase`, `addInternalRegulation`, `cancelPowerOfAttorney`) to trigger the corresponding backend API call first, and update the local state.

### C. Connect Chat Assistant Screen (`chat_screen.dart`)
- Instead of using simulated local chatbot responses, POST the message to `api/v1/SmartAnalysis/chat` using `ApiService`.
- Fall back to simulated chat response if the backend is offline.

---

## 3. Verification Plan

### Automated Checks
- Run `flutter analyze` inside the mobile directory to ensure no compilation issues or lint warnings.
- Run `flutter test` (`make test-mobile`) to ensure existing tests pass cleanly without requiring a live backend.

### Manual Verification
- Start the C# backend.
- Start the mobile app on Chrome or Emulator, perform login, and verify that cases, clients, and regulations are retrieved from the database.
- Turn off the backend and verify that the app falls back to offline/mock data mode gracefully.
