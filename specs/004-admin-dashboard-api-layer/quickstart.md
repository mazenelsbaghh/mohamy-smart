# Quickstart Guide: Admin Dashboard API Layer

This quickstart assumes you have completed the prerequisite unified environment (Phase 1).

## 1. Environment Setup

Ensure the `.env` file exists in `mohamy-smart-admin-dashboard/` containing:

```bash
VITE_API_BASE_URL=http://localhost:8976/api
```

## 2. Launching Services

1. Boot up the **Backend**:
   ```bash
   cd mohamy-smart-backend/Lawyer
   dotnet run
   ```
2. Boot up the **Admin Dashboard**:
   ```bash
   cd mohamy-smart-admin-dashboard
   npm run dev
   ```

## 3. Integration Testing Scenarios

Open `http://localhost:5079` in the browser. You can trace API logic through Redux:

- **Redux DevTools**: Open the browser extension. You should see 6 uninitialized slices (`auth`, `lawyers`, etc.) and `isLoading: false`.
- **Axios HTTP Client**: Test out logging in using actual backend Admin credentials.
- **Console Tracking**: Use Chrome DevTools (Network panel) to verify `Authorization: Bearer <token>` appending headers accurately after signing in.
- **Dual Session Access**: Boot `mohamy-smart-lawyer-dashboard` on `http://localhost:5078` simultaneously; monitor `localStorage` side-by-side to ensure isolated domains (`admin_accessToken` vs `accessToken`).
