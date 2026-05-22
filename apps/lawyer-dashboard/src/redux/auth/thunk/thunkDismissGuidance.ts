import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@mohamy/shared-api";
import api from "../../../APIs/api";

const thunkDismissGuidance = createAsyncThunk<string, string, { rejectValue: string }>(
  "auth/dismissGuidance",
  async (guidanceKey, { rejectWithValue }) => {
    try {
      await api.post("/GuidanceDismissal", { guidanceKey });
      return guidanceKey;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);

export default thunkDismissGuidance;
