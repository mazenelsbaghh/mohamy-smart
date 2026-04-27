import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";

export type TUser = {
 id: string;
 fullName: string;
 email: string | null;
 phoneNumber: string | null;
 isActive: boolean;
 barNumber: string | null;
 specialization: string | null;
 experienceNumber: string | null;
 lawFirmName: string | null;
 lawyerId: string | null;
 subscriptionPlanName: string | null;
 subscriptionIsActive: boolean | null;
 numberOfCases: number;
};

type TUsersResponse = {
 items: TUser[];
 totalPages: number;
 pageNumber: number;
 pageSize: number;
 totalCount: number;
};

type TUsersApiPayload = {
 data?: TUser[] | null;
 items?: TUser[] | null;
 totalPages?: number | null;
 pageNumber?: number | null;
 pageSize?: number | null;
 totalCount?: number | null;
 totalRecords?: number | null;
};

export const normalizeUsersResponse = (
 payload: TUsersApiPayload | null | undefined,
 fallbackPageNumber = 1,
 fallbackPageSize = 10,
): TUsersResponse => ({
 items: Array.isArray(payload?.items)
 ? payload.items
 : Array.isArray(payload?.data)
 ? payload.data
 : [],
 totalPages: payload?.totalPages ?? 1,
 pageNumber: payload?.pageNumber ?? fallbackPageNumber,
 pageSize: payload?.pageSize ?? fallbackPageSize,
 totalCount: payload?.totalCount ?? payload?.totalRecords ?? 0,
});

const fetchLawyers = createAsyncThunk<
 TUsersResponse,
 { pageNumber?: number; pageSize?: number } | undefined,
 { rejectValue: string }
>("lawyers/fetchLawyers",
 async (params = {}, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const pageNumber = params.pageNumber || 1;
 const pageSize = params.pageSize || 10;

 const res = await api.get<{ data: TUsersApiPayload }>("/Account/users", {
 params: {
 userType: 2,
 pageNumber,
 pageSize,
 },
 });

 return normalizeUsersResponse(res.data.data, pageNumber, pageSize);
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchLawyers;
