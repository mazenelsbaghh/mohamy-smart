import { createSlice } from"@reduxjs/toolkit";
import fetchContactRequests from"./thunk/fetchContactRequests";
import updateContactStatus from"./thunk/updateContactStatus";
import { showErrorToast } from"../../utils/toastHelpers";

export type TContactRequest = {
 id: string;
 name: string;
 phone: string;
 message: string;
 submittedAt: string;
 status: string;
};

type TContactState = {
 list: TContactRequest[];
 isLoading: boolean;
 error: string | null;
};

const initialState: TContactState = {
 list: [],
 isLoading: false,
 error: null,
};

const contactSlice = createSlice({
 name:"contacts",
 initialState,
 reducers: {},
 extraReducers: (builder) => {
 builder
 .addCase(fetchContactRequests.pending, (state) => {
 state.isLoading = true;
 })
 .addCase(fetchContactRequests.fulfilled, (state, action) => {
 state.isLoading = false;
 state.list = action.payload;
 })
 .addCase(fetchContactRequests.rejected, (state, action) => {
 state.isLoading = false;
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 })
 .addCase(updateContactStatus.fulfilled, (state, action) => {
 const idx = state.list.findIndex((c) => c.id === action.payload.id);
 if (idx !== -1) {
 state.list[idx] = action.payload;
 }
 })
 .addCase(updateContactStatus.rejected, (state, action) => {
 if (typeof action.payload ==="string") {
 state.error = action.payload;
 showErrorToast(action.payload);
 }
 });
 },
});

export default contactSlice.reducer;
