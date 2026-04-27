import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { TContactRequest } from"../contactSlice";

const fetchContactRequests = createAsyncThunk<TContactRequest[], string | undefined, { rejectValue: string }>("contacts/fetchContactRequests",
 async (status, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const params = status ? { status } : {};
 const res = await api.get<{ data: TContactRequest[] }>("/Contact", { params });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchContactRequests;
