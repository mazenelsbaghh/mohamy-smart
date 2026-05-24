import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../APIs/api';
import { axiosErrorHandler } from '@mohamy/shared-api';
import type { AiPointBalance } from '../../aiJobs/aiPointTypes';

export type GetAiPointBalanceArgs = {
  silent?: boolean;
} | undefined;

const thunkGetAiPointBalance = createAsyncThunk('subscription/thunkGetAiPointBalance', async (_args: GetAiPointBalanceArgs, thunkAPI) => {
  const { rejectWithValue } = thunkAPI;
  try {
    const res = await api.get('/Subscription/ai-points/balance');
    return res.data.data as AiPointBalance;
  } catch (error) {
    return rejectWithValue(axiosErrorHandler(error));
  }
});

export default thunkGetAiPointBalance;
