import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

type TUpdateClientProps = {
 clientId: string;
 clientName: string;
 phoneNumber: string;
 email?: string | null;
 notes?: string | null;
 address?: string | null;
 nationalId?: string | null;
 governorate?: string | null;
 caseId?: string | null;
}

const thunkUpdateClient = createAsyncThunk('clients/thunkUpdateClient', async ({ clientId, ...data }: TUpdateClientProps, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.put(`/Client/${clientId}`, null, {
 params: data
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkUpdateClient;
