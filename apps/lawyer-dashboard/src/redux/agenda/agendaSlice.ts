import { createSlice } from"@reduxjs/toolkit";
import type { TLoading } from"../../types/types";
import type { AgendaItem } from"../../types/agenda";
import { isString } from"@mohamy/shared-utils";
import thunkGetAgendaByCaseId from"./thunk/thunkGetAgendaByCaseId";
import thunkGetAgendaByLawyerId from"./thunk/thunkGetAgendaByLawyerId";
import thunkCreateAgendaItem from"./thunk/thunkCreateAgendaItem";

import thunkGetAgendaRoll from"./thunk/thunkGetAgendaRoll";
import type { SessionRollDto } from"../../types/agenda";

type TInitialState = {
 items: AgendaItem[];
 rollItems: SessionRollDto[];
 loading: TLoading;
 rollLoading: TLoading;
 createLoading: TLoading;
 error: string | null;
}

const initialState: TInitialState = {
 items: [],
 rollItems: [],
 loading:'idle',
 rollLoading:'idle',
 createLoading:'idle',
 error: null,
}

const agendaSlice = createSlice({
 name:'agenda',
 initialState,
 reducers: {
 clearAgenda: (state) => {
 state.items = [];
 state.loading ='idle';
 state.error = null;
 },
 },
 extraReducers(builder) {
 builder
 // Get Agenda by Case ID
 .addCase(thunkGetAgendaByCaseId.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetAgendaByCaseId.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.items = action.payload;
 })
 .addCase(thunkGetAgendaByCaseId.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Create Agenda Item
 .addCase(thunkCreateAgendaItem.pending, (state) => {
 state.createLoading ='pending';
 state.error = null;
 })
 .addCase(thunkCreateAgendaItem.fulfilled, (state) => {
 state.createLoading ='succeeded';
 })
 .addCase(thunkCreateAgendaItem.rejected, (state, action) => {
 state.createLoading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Get Agenda by Lawyer ID (all cases)
 .addCase(thunkGetAgendaByLawyerId.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetAgendaByLawyerId.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.items = action.payload;
 })
 .addCase(thunkGetAgendaByLawyerId.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 // Get Agenda Roll
 .addCase(thunkGetAgendaRoll.pending, (state) => {
 state.rollLoading ='pending';
 state.error = null;
 })
 .addCase(thunkGetAgendaRoll.fulfilled, (state, action) => {
 state.rollLoading ='succeeded';
 state.rollItems = action.payload;
 })
 .addCase(thunkGetAgendaRoll.rejected, (state, action) => {
 state.rollLoading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 });
 },
});

export const { clearAgenda } = agendaSlice.actions;
export default agendaSlice.reducer;
