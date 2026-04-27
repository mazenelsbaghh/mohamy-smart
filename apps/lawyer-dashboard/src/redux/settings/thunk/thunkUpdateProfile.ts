import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import { API_ROUTES } from'../../../APIs/routes';
import type { TProfile } from'../../../types/types';
import { axiosErrorHandler } from"@mohamy/shared-api";

export type TUpdateProfilePayload = {
 fullName: string;
 email: string;
 phoneNumber: string;
 officeName: string;
};

const thunkUpdateProfile = createAsyncThunk<TProfile, TUpdateProfilePayload, { rejectValue: string }>('settings/updateProfile',
 async (payload, thunkAPI) => {
 try {
 const response = await api.put(API_ROUTES.UPDATE_PROFILE, payload);
 return response.data.data;
 } catch (error) {
 return thunkAPI.rejectWithValue(
 axiosErrorHandler(error)
 );
 }
 }
);

export default thunkUpdateProfile;
