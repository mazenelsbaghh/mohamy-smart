import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkGetLawyerPlan = createAsyncThunk('subscription/thunkGetLawyerPlan', async ({ lawyerId }: { lawyerId: string }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get('/Subscription/lawyer', {
 params: {
 lawyerId,
 }
 });
 return res.data.data
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkGetLawyerPlan;