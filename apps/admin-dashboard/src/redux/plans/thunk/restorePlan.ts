import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@mohamy/shared-api";
import api from "../../../APIs/api";
import { showSuccessToast } from "../../../utils/toastHelpers";

const restorePlan = createAsyncThunk<number, number, { rejectValue: string }>("plans/restorePlan",
  async (planId, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      await api.patch(`/Subscription/plan/${planId}/restore`);
      showSuccessToast("تم استعادة الخطة بنجاح");
      return planId;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);

export default restorePlan;
