import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";

export type TSubscription = {
  id: number;
  name: string;
  features: string;
  price: number;
  aiRequestsLimit: number;
  durationDays: number;
  isActive: boolean;
  isPopular: boolean;
  showOnLanding: boolean;
  yearlyPrice?: number | null;
  yearlyDurationDays?: number | null;
  hasYearlyOption?: boolean;
};

const fetchPlans = createAsyncThunk<TSubscription[], void, { rejectValue: string }>("plans/fetchPlans",
 async (_, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<{ data: TSubscription[] }>("/Subscription?includeArchived=true");
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchPlans;
