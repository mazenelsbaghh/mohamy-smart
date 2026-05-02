import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { TLawyerDetail } from"./fetchLawyers";

const fetchLawyerById = createAsyncThunk<
 TLawyerDetail,
 string,
 { rejectValue: string }
>("lawyers/fetchLawyerById",
 async (id, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<{ data: TLawyerDetail }>(`/lawyers/${id}`);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchLawyerById;
