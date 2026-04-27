import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkGetSingleCase = createAsyncThunk('cases/thunkGetSingleCase', async ({ id }: { id: string }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get(`/Case/${id}`);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkGetSingleCase;