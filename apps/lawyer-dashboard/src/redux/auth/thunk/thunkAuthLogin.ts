import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api, { fetchCsrfToken } from"../../../APIs/api";
import type { TUser } from"../../../types/types";

type TLoginResponse = {
 statusCode: number;
 meta: null;
 succeeded: boolean;
 message: string | null;
 errors: string[];
 data: {
 userId: string;
 fullName: string;
 profileId: string;
 roles: string[];
 phone: string;
 dismissedGuidanceKeys?: string[];
 // T014: accessToken / refreshToken may still be in response body during the
 // transition period (Auth:ReturnTokensInBody=true on backend). We deliberately
 // do NOT read or store them — the browser already received and stored the
 // httpOnly cookies from the Set-Cookie response headers.
 };
};

const thunkAuthLogin = createAsyncThunk("auth/thunkAuthLogin",
 async (data: { phone: string; password: string }, { rejectWithValue }) => {
 try {
 const formData = new FormData();
 formData.append("PhoneNumber", data.phone);
 formData.append("Password", data.password);

 const res = await api.post<TLoginResponse>("/Auth/login", formData);

 // T033: Fetch and store the CSRF token right after login so state-changing
 // requests (PUT/POST/DELETE) carry a valid X-XSRF-TOKEN header.
 await fetchCsrfToken();

 // T014: Return only the safe user profile — no tokens.
 const { userId, fullName, profileId, roles, phone, dismissedGuidanceKeys } = res.data.data;
 return { userId, fullName, profileId, roles, phone, dismissedGuidanceKeys } as TUser;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkAuthLogin;