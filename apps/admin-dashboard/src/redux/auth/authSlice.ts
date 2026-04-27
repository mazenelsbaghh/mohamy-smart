import { createSlice, createAsyncThunk } from"@reduxjs/toolkit";
import thunkAuthLogin from"./thunk/thunkAuthLogin";
import thunkAuthMe from"./thunk/thunkAuthMe";
import { showSuccessToast, showErrorToast } from"../../utils/toastHelpers";
import type { TAdminUser } from"../../types";

type AuthStatus ="unknown" |"authenticated" |"unauthenticated";

type TAuthState = {
 user: TAdminUser | null;
 // T017: token and refreshToken removed — stored in httpOnly cookies, not Redux.
 status: AuthStatus;
 isLoading: boolean;
 error: string | null;
};

// T017: Load non-sensitive user profile from localStorage (no tokens).
const getSavedUser = (key: string): TAdminUser | null => {
 try {
 const saved = localStorage.getItem(key);
 return saved ? JSON.parse(saved) : null;
 } catch {
 localStorage.removeItem(key);
 return null;
 }
};

const initialState: TAuthState = {
 user: getSavedUser("admin_user"),
 status:"unknown", // resolved by thunkAuthMe on boot
 isLoading: false,
 error: null,
};

// T037: thunkLogOut — POST /api/auth/logout to clear cookies server-side.
const thunkLogOut = createAsyncThunk("auth/thunkLogOut", async () => {
 try {
 const { default: api } = await import("../../APIs/api");
 await api.post("/Auth/logout");
 } finally {
 localStorage.removeItem("admin_user");
 window.location.replace("/auth/login");
 }
});

const authSlice = createSlice({
 name:"auth",
 initialState,
 reducers: {},
 extraReducers(builder) {
 builder
 // T021: /auth/me — hydrate user from cookie session on app boot
 .addCase(thunkAuthMe.pending, (state) => {
 state.status ="unknown";
 })
 .addCase(thunkAuthMe.fulfilled, (state, action) => {
 state.status ="authenticated";
 state.user = action.payload as TAdminUser;
 localStorage.setItem("admin_user", JSON.stringify(action.payload));
 })
 .addCase(thunkAuthMe.rejected, (state) => {
 state.status ="unauthenticated";
 state.user = null;
 localStorage.removeItem("admin_user");
 })

 // T037: thunkLogOut
 .addCase(thunkLogOut.fulfilled, (state) => {
 state.user = null;
 state.status ="unauthenticated";
 })
 .addCase(thunkLogOut.rejected, (state) => {
 state.user = null;
 state.status ="unauthenticated";
 })

 // Login — T015: no longer stores tokens
 .addCase(thunkAuthLogin.pending, (state) => {
 state.isLoading = true;
 state.error = null;
 })
 .addCase(thunkAuthLogin.fulfilled, (state, action) => {
 state.isLoading = false;
 state.status ="authenticated";
 // T015: Only non-sensitive profile stored — tokens are in httpOnly cookies.
 const userData: TAdminUser = {
 userId: action.payload.userId,
 fullName: action.payload.fullName,
 roles: action.payload.roles,
 email: action.payload.email,
 phone: action.payload.phone,
 };
 state.user = userData;
 localStorage.setItem("admin_user", JSON.stringify(userData));
 showSuccessToast("تم تسجيل الدخول بنجاح");
 })
 .addCase(thunkAuthLogin.rejected, (state, action) => {
 state.isLoading = false;
 state.status ="unauthenticated";
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 });
 },
});

export { thunkLogOut };
export default authSlice.reducer;
