import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { SessionRollDto } from"../../../types/agenda";

const thunkGetAgendaRoll = createAsyncThunk('agenda/getAgendaRoll',
 async (args: { date?: string, lawyerId?: string } | undefined, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const params = new URLSearchParams();
 if (args?.date) params.append("date", args.date);
 if (args?.lawyerId) params.append("lawyerId", args.lawyerId);

 const res = await api.get(`/Agenda/agenda-roll?${params.toString()}`);
 return res.data as SessionRollDto[];
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkGetAgendaRoll;
