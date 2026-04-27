import { createSlice } from'@reduxjs/toolkit';
import type { AdminProfile } from'../../types';
import { fetchAdminProfile } from'./thunk/fetchAdminProfile';
import { updateAdminProfile } from'./thunk/updateAdminProfile';
import { changeAdminPassword } from'./thunk/changeAdminPassword';

export interface AdminSettingsState {
  profile: AdminProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  isPasswordLoading: boolean;
  error: string | null;
}

const initialState: AdminSettingsState = {
  profile: null,
  isLoading: false,
  isProfileLoading: false,
  isPasswordLoading: false,
  error: null,
};

const settingsSlice = createSlice({
 name:'settings',
 initialState,
 reducers: {
 clearSettingsError: (state) => {
 state.error = null;
 },
 },
 extraReducers: (builder) => {
 builder
  .addCase(fetchAdminProfile.pending, (state) => {
  state.isLoading = true;
  state.isProfileLoading = true;
  state.error = null;
  })
  .addCase(fetchAdminProfile.fulfilled, (state, action) => {
  state.isLoading = false;
  state.isProfileLoading = false;
  state.profile = action.payload;
  })
  .addCase(fetchAdminProfile.rejected, (state, action) => {
  state.isLoading = false;
  state.isProfileLoading = false;
  state.error = action.payload as string;
  })
  .addCase(updateAdminProfile.pending, (state) => {
  state.isLoading = true;
  state.isProfileLoading = true;
  state.error = null;
  })
  .addCase(updateAdminProfile.fulfilled, (state, action) => {
  state.isLoading = false;
  state.isProfileLoading = false;
  state.profile = action.payload;
  })
  .addCase(updateAdminProfile.rejected, (state, action) => {
  state.isLoading = false;
  state.isProfileLoading = false;
  state.error = action.payload as string;
  })
  .addCase(changeAdminPassword.pending, (state) => {
  state.isPasswordLoading = true;
  state.error = null;
  })
  .addCase(changeAdminPassword.fulfilled, (state) => {
  state.isPasswordLoading = false;
  })
  .addCase(changeAdminPassword.rejected, (state, action) => {
  state.isPasswordLoading = false;
  state.error = action.payload as string;
  });
 },
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
