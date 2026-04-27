import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import { normalizeDigits } from"@mohamy/shared-utils";


type TPropsData = {
 clientName: string;
 phoneNumber: string;
 email?: string | null;
 notes?: string | null;
 address?: string | null;
 nationalId?: string | null;
 governorate?: string | null;
 caseId?: string | null;
}

const thunkAddNewClient = createAsyncThunk('clients/thunkAddNewClient', async (data: TPropsData, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const cleanOptional = (value?: string | null) => {
 const trimmed = value?.trim();
 return trimmed ? trimmed : undefined;
 };

 const res = await api.post('/Client/create', {
 clientName: data.clientName.trim(),
 phoneNumber: normalizeDigits(data.phoneNumber).trim(),
 email: cleanOptional(data.email),
 notes: cleanOptional(data.notes),
 address: cleanOptional(data.address),
 nationalId: cleanOptional(data.nationalId ? normalizeDigits(data.nationalId) : data.nationalId),
 governorate: cleanOptional(data.governorate),
 caseId: data.caseId || undefined,
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkAddNewClient;
