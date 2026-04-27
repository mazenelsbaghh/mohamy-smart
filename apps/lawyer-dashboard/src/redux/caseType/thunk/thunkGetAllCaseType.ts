import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkGetAllCaseType = createAsyncThunk('clients/thunkGetAllCaseType', async (_, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get('/CaseType');
 return res.data
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkGetAllCaseType;