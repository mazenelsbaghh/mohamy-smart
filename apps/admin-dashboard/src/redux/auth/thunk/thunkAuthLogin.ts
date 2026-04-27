import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api, { fetchCsrfToken } from"../../../APIs/api";
import type { TAdminUser } from"../../../types";

type TLoginResponse = {
 statusCode: number;
 succeeded: boolean;
 message: string | null;
 data: TAdminUser & { accessToken?: string; refreshToken?: string };
};

const thunkAuthLogin = createAsyncThunk("auth/thunkAuthLogin",
 async (data: { email: string; password: string }, { rejectWithValue }) => {
 try {
 const formData = new FormData();
 formData.append("Email", data.email);
 formData.append("Password", data.password);

 const res = await api.post<TLoginResponse>("/Auth/admin/login", formData);

 // T034: Fetch and store the CSRF token right after login so state-changing
 // requests (PUT/POST/DELETE) carry a valid X-XSRF-TOKEN header.
 await fetchCsrfToken();

 // T015: Return only the non-sensitive profile — strip tokens if they're in the body.
 const { userId, fullName, roles, email, phone } = res.data.data;
 return { userId, fullName, roles, email, phone } as TAdminUser;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkAuthLogin;
