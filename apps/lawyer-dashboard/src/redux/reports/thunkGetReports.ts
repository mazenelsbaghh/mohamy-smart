import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";


const thunkGetReports = createAsyncThunk('cases/thunkGetReports', async (_, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get(`/Case/dashboard-report`);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkGetReports;