import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { CreateAgendaItemDto } from"../../../types/agenda";

const thunkCreateAgendaItem = createAsyncThunk('agenda/createItem',
 async ({ item }: { item: CreateAgendaItemDto }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.post(`/Agenda`, item);
 return res.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkCreateAgendaItem;
