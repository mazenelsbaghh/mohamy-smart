import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkGetAgendaByLawyerId = createAsyncThunk('agenda/getByLawyerId',
 async ({ lawyerId }: { lawyerId: string }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get(`/Agenda/lawyer/${lawyerId}`);
 return Array.isArray(res.data) ? res.data : (res.data?.data || []);
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkGetAgendaByLawyerId;
