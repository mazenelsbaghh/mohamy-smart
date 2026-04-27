import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";

// T036: Logout thunk — POST /api/auth/logout revokes the refresh token server-side
// and returns Set-Cookie headers that expire all three cookies (session, refresh, XSRF-TOKEN).
// Dispatch this instead of the synchronous logOut action to ensure proper cookie cleanup.
const thunkLogout = createAsyncThunk<void, void, { rejectValue: string }>("auth/logout",
 async (_, { rejectWithValue }) => {
 try {
 await api.post("/Auth/logout");
 } catch {
 // Even if the server call fails, we still clear local state and redirect.
 // The refresh cookie will expire on its own after 7 days.
 return rejectWithValue("فشل تسجيل الخروج من الخادم.");
 } finally {
 window.location.replace("/auth/login");
 }
 }
);

export default thunkLogout;
