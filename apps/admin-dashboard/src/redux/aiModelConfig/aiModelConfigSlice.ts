import { createSlice } from'@reduxjs/toolkit';
import type { AiModelConfigState } from'../../types';
import { fetchAiModelConfig } from'./thunk/fetchAiModelConfig';
import { updateAiModelConfig } from'./thunk/updateAiModelConfig';

const initialState: AiModelConfigState = {
 configs: [],
 models: [],
 stages: [],
 isLoading: false,
 error: null,
};

const aiModelConfigSlice = createSlice({
 name:'aiModelConfig',
 initialState,
 reducers: {
 clearAiModelConfigError: (state) => {
 state.error = null;
 },
 updateLocalConfig: (state, action) => {
 const { stepType, modelIdentifier } = action.payload;
 const config = state.configs.find(c => c.stepType === stepType);
 if (config) {
 config.modelIdentifier = modelIdentifier;
 }
 },
 },
 extraReducers: (builder) => {
 builder
 .addCase(fetchAiModelConfig.pending, (state) => {
 state.isLoading = true;
 state.error = null;
 })
 .addCase(fetchAiModelConfig.fulfilled, (state, action) => {
 state.isLoading = false;
 state.configs = action.payload;
 })
 .addCase(fetchAiModelConfig.rejected, (state, action) => {
 state.isLoading = false;
 state.error = action.payload as string;
 })
 .addCase(updateAiModelConfig.pending, (state) => {
 state.isLoading = true;
 state.error = null;
 })
 .addCase(updateAiModelConfig.fulfilled, (state, action) => {
 state.isLoading = false;
 state.configs = action.payload;
 })
 .addCase(updateAiModelConfig.rejected, (state, action) => {
 state.isLoading = false;
 state.error = action.payload as string;
 });
 },
});

export const { clearAiModelConfigError, updateLocalConfig } = aiModelConfigSlice.actions;
export default aiModelConfigSlice.reducer;
