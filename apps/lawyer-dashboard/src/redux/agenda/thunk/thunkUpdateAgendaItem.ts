import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { AgendaItem, CreateAgendaItemDto } from"../../../types/agenda";

const thunkUpdateAgendaItem = createAsyncThunk('agenda/updateItem',
 async ({ id, item }: { id: string; item: CreateAgendaItemDto }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.put(`/Agenda/${id}`, item);
 return (res.data?.data ?? res.data) as AgendaItem;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkUpdateAgendaItem;
