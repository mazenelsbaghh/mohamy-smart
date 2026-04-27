import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { TUser } from"./fetchLawyers";

const fetchLawyerById = createAsyncThunk<
 TUser,
 string,
 { rejectValue: string }
>("lawyers/fetchLawyerById",
 async (id, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<{ data: TUser }>(`/lawyers/${id}`);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchLawyerById;
