import { createSlice } from'@reduxjs/toolkit';
import type { TProfile, TLoading } from'../../types/types';
import thunkGetProfile from'./thunk/thunkGetProfile';
import thunkUpdateProfile from'./thunk/thunkUpdateProfile';
import thunkChangePassword from'./thunk/thunkChangePassword';

interface SettingsState {
 profile: TProfile | null;
 loading: TLoading;
 updateLoading: TLoading;
 passwordLoading: TLoading;
 error: string | null;
 updateError: string | null;
 passwordError: string | null;
}

const initialState: SettingsState = {
 profile: null,
 loading:'idle',
 updateLoading:'idle',
 passwordLoading:'idle',
 error: null,
 updateError: null,
 passwordError: null,
};

const settingsSlice = createSlice({
 name:'settings',
 initialState,
 reducers: {
 clearSettingsErrors: (state) => {
 state.error = null;
 state.updateError = null;
 state.passwordError = null;
 }
 },
 extraReducers: (builder) => {
 // Get Profile
 builder.addCase(thunkGetProfile.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 });
 builder.addCase(thunkGetProfile.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.profile = action.payload;
 });
 builder.addCase(thunkGetProfile.rejected, (state, action) => {
 state.loading ='failed';
 state.error = action.payload ??'Error loading profile';
 });

 // Update Profile
 builder.addCase(thunkUpdateProfile.pending, (state) => {
 state.updateLoading ='pending';
 state.updateError = null;
 });
 builder.addCase(thunkUpdateProfile.fulfilled, (state, action) => {
 state.updateLoading ='succeeded';
 state.profile = action.payload;
 });
 builder.addCase(thunkUpdateProfile.rejected, (state, action) => {
 state.updateLoading ='failed';
 state.updateError = action.payload ??'Error updating profile';
 });

 // Change Password
 builder.addCase(thunkChangePassword.pending, (state) => {
 state.passwordLoading ='pending';
 state.passwordError = null;
 });
 builder.addCase(thunkChangePassword.fulfilled, (state) => {
 state.passwordLoading ='succeeded';
 });
 builder.addCase(thunkChangePassword.rejected, (state, action) => {
 state.passwordLoading ='failed';
 state.passwordError = action.payload ??'Error changing password';
 });
 }
});

export const { clearSettingsErrors } = settingsSlice.actions;

export default settingsSlice.reducer;
