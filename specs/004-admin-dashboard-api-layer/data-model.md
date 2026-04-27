# Phase 1: Data Model & State Architecture

## Redux Global State Definition

```typescript
// Shared Data Fetching States
type TLoadingState = 'idle' | 'pending' | 'succeeded' | 'failed';

// Admin User Entity
export type TAdminUser = {
    userId: string;
    fullName: string;
    roles: string[]; // typically ["Admin"]
    email?: string;
    phone?: string;
};

// Root State Definition
export type TRootState = {
  auth: {
    user: TAdminUser | null;
    token: string | null;
    loading: TLoadingState;
    error: string | null;
  };
  lawyers: { data: any[]; isLoading: boolean; error: string | null };
  subscriptions: { data: any[]; isLoading: boolean; error: string | null };
  plans: { data: any[]; isLoading: boolean; error: string | null };
  notifications: { data: any[]; isLoading: boolean; error: string | null };
  reports: { data: any[]; isLoading: boolean; error: string | null };
}
```

## Local Storage State

- `admin_accessToken`: (string) Short-lived JWT valid for 15 minutes.
- `admin_refreshToken`: (string) Long-lived token used to negotiate a new accessToken.
- `admin_user`: (stringified JSON) Caches the `TAdminUser` representation locally.  
*(Note: Distinct prefix isolated from the Lawyer dashboard state)*

## API Integration Model

- Base URL: Read from `import.meta.env.VITE_API_BASE_URL`
- Request Headers:
  - Standard payloads get `Authorization: Bearer <admin_accessToken>`
  - FormData bodies get automatically attached `Content-Type: multipart/form-data`
