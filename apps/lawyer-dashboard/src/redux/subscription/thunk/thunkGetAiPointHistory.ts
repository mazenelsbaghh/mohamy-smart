import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../APIs/api';
import { axiosErrorHandler } from '@mohamy/shared-api';
import type { AiPointTransaction } from '../../aiJobs/aiPointTypes';

const thunkGetAiPointHistory = createAsyncThunk('subscription/thunkGetAiPointHistory', async (_, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const res = await api.get('/Subscription/ai-points/history');
    return res.data.data as AiPointTransaction[];
  } catch (error) {
    return rejectWithValue(axiosErrorHandler(error));
  }
});

export default thunkGetAiPointHistory;
