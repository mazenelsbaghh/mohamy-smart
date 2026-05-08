import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkDeleteAgendaItem = createAsyncThunk('agenda/deleteItem',
 async ({ id, caseId }: { id: string; caseId: string }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 await api.delete(`/Agenda/${id}`, { params: { caseId } });
 return id;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkDeleteAgendaItem;
