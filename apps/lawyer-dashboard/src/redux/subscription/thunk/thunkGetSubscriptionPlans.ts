import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

const thunkGetSubscriptionPlans = createAsyncThunk('subscription/thunkGetSubscriptionPlans', async (_, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get('/Subscription');
 // Backend stores Features as a plain string; normalize to string[] here
 const plans = (res.data.data ?? []).map((plan: Record<string, unknown>) => ({
 ...plan,
 features: typeof plan.features ==='string'
 ? plan.features.split(',').map((f: string) => f.trim()).filter(Boolean)
 : Array.isArray(plan.features)
 ? plan.features
 : [],
 }));
 return plans;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});


export default thunkGetSubscriptionPlans;