import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import { showSuccessToast } from"../../../utils/toastHelpers";

const archivePlan = createAsyncThunk<number, number, { rejectValue: string }>("plans/archivePlan",
 async (planId, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 await api.patch(`/Subscription/plan/${planId}/archive`);
 showSuccessToast("تم أرشفة الخطة بنجاح");
 return planId;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default archivePlan;
