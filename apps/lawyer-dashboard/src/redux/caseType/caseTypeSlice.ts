import { createSlice } from"@reduxjs/toolkit";
import type { TLoading } from"../../types/types";
import thunkGetAllCaseType from"./thunk/thunkGetAllCaseType";
import { isString } from"@mohamy/shared-utils";

type TInitialState = {
 caseType: {
 id: number;
 title: string;
 }[];
 loading: TLoading;
 error: string | null;
}


const initialState: TInitialState = {
 caseType: [],
 loading:'idle',
 error: null,
}

const caseTypeSlice = createSlice({
 name:'clients',
 initialState,
 reducers: {},
 extraReducers(builder) {
 builder
 .addCase(thunkGetAllCaseType.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetAllCaseType.fulfilled, (state, action) => {
 state.loading ='succeeded';
 const payloadData = action.payload?.data;
 state.caseType = Array.isArray(payloadData) ? payloadData : (Array.isArray(payloadData?.data) ? payloadData.data : []);
 })
 .addCase(thunkGetAllCaseType.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })
 },
});

export default caseTypeSlice.reducer;