import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import { API_ROUTES } from'../../../APIs/routes';
import type { TProfile } from'../../../types/types';
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkGetProfile = createAsyncThunk<TProfile, void, { rejectValue: string }>('settings/getProfile',
 async (_, thunkAPI) => {
 try {
 const response = await api.get(API_ROUTES.GET_PROFILE);
 return response.data.data;
 } catch (error) {
 return thunkAPI.rejectWithValue(
 axiosErrorHandler(error)
 );
 }
 }
);

export default thunkGetProfile;
