import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import type { TUser } from"../../../types/types";

// T020: Fetch the authenticated user profile from the server on app boot.
// Relies on the httpOnly session cookie — no token passed in headers.
// ProtectedRoute dispatches this on mount to determine session validity.
const thunkAuthMe = createAsyncThunk<TUser, void, { rejectValue: string }>("auth/me",
 async (_, { rejectWithValue }) => {
 try {
 const response = await api.get("/Auth/me");
 // Backend returns { data: { userId, fullName, email, roles, dismissedGuidanceKeys } }
 const { userId, fullName, roles, phone, profileId, dismissedGuidanceKeys } = response.data.data;
 return { userId, fullName, roles, phone: phone ??"", profileId: profileId ??"", dismissedGuidanceKeys } as TUser;
 } catch {
 return rejectWithValue("الجلسة منتهية. الرجاء تسجيل الدخول مجدداً.");
 }
 }
);

export default thunkAuthMe;
