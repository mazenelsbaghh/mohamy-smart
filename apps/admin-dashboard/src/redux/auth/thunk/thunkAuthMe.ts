import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import type { TAdminUser } from"../../../types";

// T021: Admin dashboard equivalent of thunkAuthMe.
// Called by AdminRoute on mount to confirm the session cookie is still valid.
const thunkAuthMe = createAsyncThunk<TAdminUser, void, { rejectValue: string }>("auth/me",
 async (_, { rejectWithValue }) => {
 try {
 const response = await api.get("/Auth/me");
 const { userId, fullName, roles, email, phone } = response.data.data;
 return { userId, fullName, roles, email, phone } as TAdminUser;
 } catch {
 return rejectWithValue("الجلسة منتهية. الرجاء تسجيل الدخول مجدداً.");
 }
 }
);

export default thunkAuthMe;
