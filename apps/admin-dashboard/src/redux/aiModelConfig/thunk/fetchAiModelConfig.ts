import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import type { AiStageModelConfig } from'../../../types';
import { ADMIN_ROUTES } from'../../../APIs/routes';

export const fetchAiModelConfig = createAsyncThunk<AiStageModelConfig[], void, { rejectValue: string }>('aiModelConfig/fetchAiModelConfig',
 async (_, { rejectWithValue }) => {
 try {
 const response = await api.get<{ data: AiStageModelConfig[] }>(
 ADMIN_ROUTES.AI_MODEL_CONFIG.BASE
 );
 return response.data.data;
 } catch (error) {
 const err = error as { response?: { data?: { message?: string } } };
 return rejectWithValue(err.response?.data?.message ||'فشل في تحميل إعدادات النماذج');
 }
 }
);
