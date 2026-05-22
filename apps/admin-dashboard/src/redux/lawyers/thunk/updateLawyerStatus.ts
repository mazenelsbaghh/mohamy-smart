import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";

const updateLawyerStatus = createAsyncThunk<
  { id: string; isActive: boolean },
  { id: string; isActive: boolean },
  { rejectValue: string }
>("lawyers/updateLawyerStatus",
  async (data, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
  await api.patch(`/lawyers/${data.id}/status`, {
  isActive: data.isActive,
  });
  return { id: data.id, isActive: data.isActive };
  } catch (error) {
  return rejectWithValue(axiosErrorHandler(error));
  }
  }
);

export default updateLawyerStatus;
