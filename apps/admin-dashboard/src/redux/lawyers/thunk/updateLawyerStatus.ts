import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { TUser } from"./fetchLawyers";

const updateLawyerStatus = createAsyncThunk<
 TUser,
 { id: string; isActive: boolean },
 { rejectValue: string }
>("lawyers/updateLawyerStatus",
 async (data, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.patch<{ data: TUser }>(`/lawyers/${data.id}/status`, {
 isActive: data.isActive,
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default updateLawyerStatus;
