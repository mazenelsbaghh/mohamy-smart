import { createSlice } from"@reduxjs/toolkit";
import type { TLoading } from"../../types/types";
import { isString } from"@mohamy/shared-utils";
import thunkGetReports from"./thunkGetReports";


type TInitialState = {
 reports: {
 totalCases: number;
 totalActiveCases: number;
 totalClients: number;
 } | null;
 loading: TLoading;
 error: string | null;
}

const initialState: TInitialState = {
 reports: null,
 loading:'idle',
 error: null,
}

const reportSlice = createSlice({
 name:'cases',
 initialState,
 reducers: {},
 extraReducers(builder) {
 builder
 // Get lawyer Reports
 .addCase(thunkGetReports.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetReports.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.reports = action.payload;
 })
 .addCase(thunkGetReports.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 },
});

export default reportSlice.reducer;