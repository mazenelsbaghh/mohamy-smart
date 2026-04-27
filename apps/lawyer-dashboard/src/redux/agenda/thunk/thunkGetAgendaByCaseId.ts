import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkGetAgendaByCaseId = createAsyncThunk('agenda/getByCaseId',
 async ({ caseId }: { caseId: string }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get(`/Agenda/case/${caseId}`);
 return Array.isArray(res.data) ? res.data : (res.data?.data || []);
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkGetAgendaByCaseId;
