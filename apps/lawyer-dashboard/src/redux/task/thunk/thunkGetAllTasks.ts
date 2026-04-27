import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkGetAllTasks = createAsyncThunk('thunkGetAllTasks/tasks', async ({ lawyerId }: { lawyerId: string }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get(`/LawyerTask`, {
 params: {
 lawyerId
 }
 })
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error))
 }
})

export default thunkGetAllTasks;