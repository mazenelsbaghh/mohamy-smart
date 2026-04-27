import { createAsyncThunk } from'@reduxjs/toolkit';
import api from'../../../APIs/api';
import type { AiStageModelConfig, UpdateAiModelConfigRequest } from'../../../types';
import { ADMIN_ROUTES } from'../../../APIs/routes';

export const updateAiModelConfig = createAsyncThunk<AiStageModelConfig[], UpdateAiModelConfigRequest, { rejectValue: string }>('aiModelConfig/updateAiModelConfig',
 async (data, { rejectWithValue }) => {
 try {
 const response = await api.put<{ data: AiStageModelConfig[] }>(
 ADMIN_ROUTES.AI_MODEL_CONFIG.BASE,
 data
 );
 return response.data.data;
 } catch (error) {
 const err = error as { response?: { data?: { message?: string } } };
 return rejectWithValue(err.response?.data?.message ||'فشل في حفظ إعدادات النماذج');
 }
 }
);
