import { createSlice } from"@reduxjs/toolkit";
import type { TLoading, TUser } from"../../types/types";
import thunkAuthRegister from"./thunk/thunkAuthRegister";
import { isString } from"@mohamy/shared-utils";
import thunkAuthLogin from"./thunk/thunkAuthLogin";
import thunkForgotPassword from"./thunk/thunkForgotPassword";
import thunkVerifyOtp from"./thunk/thunkVerifyOtp";
import thunkResetPassword from"./thunk/thunkResetPassword";
import thunkRequestPhoneVerification from"./thunk/thunkRequestPhoneVerification";
import thunkVerifyPhoneNumber from"./thunk/thunkVerifyPhoneNumber";
import thunkAuthMe from"./thunk/thunkAuthMe";
import thunkLogout from"./thunk/thunkLogout";
import thunkDismissGuidance from"./thunk/thunkDismissGuidance";

// T022: auth status drives ProtectedRoute rendering.
//'unknown' = /auth/me not yet called (app boot / page refresh).
//'authenticated' = /auth/me returned 200 (valid session cookie).
//'unauthenticated' = /auth/me returned 401 (no session or session expired after refresh failure).
type AuthStatus ="unknown" |"authenticated" |"unauthenticated";

type TInitialState = {
 // T016: token removed — authentication is carried by httpOnly cookie, not Redux state.
 user: TUser | null;
 status: AuthStatus;
 loading: TLoading;
 error: string | null;
 pendingVerificationPhone: string;
 pendingVerificationMessage: string | null;
 recoveryStep:"request" |"verify" |"reset";
 recoveryPhone: string;
 recoveryMessage: string | null;
};

// T016: Load safe user profile (no tokens) from localStorage for page-refresh hydration.
// The cookie is still present in the browser; the first API call will confirm validity.
const getSavedUser = (key: string): TUser | null => {
 try {
 const saved = localStorage.getItem(key);
 return saved ? JSON.parse(saved) : null;
 } catch {
 localStorage.removeItem(key);
 return null;
 }
};

const initialState: TInitialState = {
 user: getSavedUser("user"),
 status:"unknown", // will be resolved by thunkAuthMe on app boot
 loading:"idle",
 error: null,
 pendingVerificationPhone:"",
 pendingVerificationMessage: null,
 recoveryStep:"request",
 recoveryPhone:"",
 recoveryMessage: null,
};

const authSlice = createSlice({
 name:"auth",
 initialState,
 reducers: {
 // T016: logOut no longer touches localStorage tokens — cookies are cleared server-side.
 // Call thunkLogout (which hits POST /api/auth/logout) instead of dispatching this directly.
 logOut: (state) => {
 state.user = null;
 state.status ="unauthenticated";
 state.loading ="idle";
 state.error = null;
 localStorage.removeItem("user");
 },
 setRecoveryPhone: (state, action) => {
 state.recoveryPhone = action.payload;
 },
 setPendingVerificationPhone: (state, action) => {
 state.pendingVerificationPhone = action.payload;
 },
 clearPendingVerification: (state) => {
 state.pendingVerificationPhone ="";
 state.pendingVerificationMessage = null;
 },
 resetRecoveryState: (state) => {
 state.recoveryStep ="request";
 state.recoveryPhone ="";
 state.recoveryMessage = null;
 state.error = null;
 },
 },
 extraReducers(builder) {
 builder
 // T020: /auth/me — hydrate user from cookie session on app boot / page refresh
 .addCase(thunkAuthMe.pending, (state) => {
 state.status ="unknown";
 })
 .addCase(thunkAuthMe.fulfilled, (state, action) => {
 state.status ="authenticated";
 state.user = action.payload;
 localStorage.setItem("user", JSON.stringify(action.payload));
 })
 .addCase(thunkAuthMe.rejected, (state) => {
 state.status ="unauthenticated";
 state.user = null;
 localStorage.removeItem("user");
 })

 // T036: thunkLogout — POST /api/auth/logout → clear cookies server-side
 .addCase(thunkLogout.fulfilled, (state) => {
 state.user = null;
 state.status ="unauthenticated";
 localStorage.removeItem("user");
 })
 .addCase(thunkLogout.rejected, (state) => {
 // Even on failure, treat as unauthenticated locally
 state.user = null;
 state.status ="unauthenticated";
 localStorage.removeItem("user");
 })

 // Register
 .addCase(thunkAuthRegister.pending, (state) => {
 state.loading ="pending";
 state.error = null;
 })
 .addCase(thunkAuthRegister.fulfilled, (state, action) => {
 state.loading ="succeeded";
 state.pendingVerificationPhone = action.payload.phoneNumber;
 state.pendingVerificationMessage = action.payload.message;
 })
 .addCase(thunkAuthRegister.rejected, (state, action) => {
 state.loading ="failed";
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })

 // Login — T014: no longer stores accessToken/refreshToken
 .addCase(thunkAuthLogin.pending, (state) => {
 state.loading ="pending";
 state.error = null;
 })
 .addCase(thunkAuthLogin.fulfilled, (state, action) => {
 state.loading ="succeeded";
 // T014: Only store non-sensitive user profile. Tokens live in httpOnly cookies.
 const userData: TUser = {
 userId: action.payload.userId,
 fullName: action.payload.fullName,
 profileId: action.payload.profileId,
 roles: action.payload.roles,
 phone: action.payload.phone,
 dismissedGuidanceKeys: action.payload.dismissedGuidanceKeys,
 };
 state.user = userData;
 state.status ="authenticated";
 localStorage.setItem("user", JSON.stringify(userData));
 })
 .addCase(thunkAuthLogin.rejected, (state, action) => {
 state.loading ="failed";
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })

 .addCase(thunkRequestPhoneVerification.pending, (state) => {
 state.loading ="pending";
 state.error = null;
 })
 .addCase(thunkRequestPhoneVerification.fulfilled, (state, action) => {
 state.loading ="succeeded";
 state.pendingVerificationMessage = action.payload;
 })
 .addCase(thunkRequestPhoneVerification.rejected, (state, action) => {
 state.loading ="failed";
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 .addCase(thunkVerifyPhoneNumber.pending, (state) => {
 state.loading ="pending";
 state.error = null;
 })
 .addCase(thunkVerifyPhoneNumber.fulfilled, (state, action) => {
 state.loading ="succeeded";
 state.pendingVerificationMessage = action.payload;
 })
 .addCase(thunkVerifyPhoneNumber.rejected, (state, action) => {
 state.loading ="failed";
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 .addCase(thunkForgotPassword.pending, (state) => {
 state.loading ="pending";
 state.error = null;
 })
 .addCase(thunkForgotPassword.fulfilled, (state, action) => {
 state.loading ="succeeded";
 state.recoveryStep ="verify";
 state.recoveryMessage = action.payload;
 })
 .addCase(thunkForgotPassword.rejected, (state, action) => {
 state.loading ="failed";
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 .addCase(thunkVerifyOtp.pending, (state) => {
 state.loading ="pending";
 state.error = null;
 })
 .addCase(thunkVerifyOtp.fulfilled, (state, action) => {
 state.loading ="succeeded";
 state.recoveryStep ="reset";
 state.recoveryMessage = action.payload;
 })
 .addCase(thunkVerifyOtp.rejected, (state, action) => {
 state.loading ="failed";
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 .addCase(thunkResetPassword.pending, (state) => {
 state.loading ="pending";
 state.error = null;
 })
 .addCase(thunkResetPassword.fulfilled, (state, action) => {
 state.loading ="succeeded";
 state.recoveryStep ="request";
 state.recoveryPhone ="";
 state.recoveryMessage = action.payload;
 })
 .addCase(thunkResetPassword.rejected, (state, action) => {
 state.loading ="failed";
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 .addCase(thunkDismissGuidance.fulfilled, (state, action) => {
  if (state.user) {
  if (!state.user.dismissedGuidanceKeys) {
  state.user.dismissedGuidanceKeys = [];
  }
  if (!state.user.dismissedGuidanceKeys.includes(action.payload)) {
  state.user.dismissedGuidanceKeys.push(action.payload);
  }
  localStorage.setItem("user", JSON.stringify(state.user));
  }
  });
 },
});

export const {
 logOut,
 setRecoveryPhone,
 setPendingVerificationPhone,
 clearPendingVerification,
 resetRecoveryState,
} = authSlice.actions;

export default authSlice.reducer;
