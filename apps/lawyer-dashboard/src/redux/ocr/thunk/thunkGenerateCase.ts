import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

type GenerateCaseArgs = {
 revisedText: string;
 availableCaseTypes?: { id: number; title: string }[];
};

const thunkGenerateCase = createAsyncThunk('ocr/thunkGenerateCase', async (args: GenerateCaseArgs | string, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 // Support both old string signature and new object signature
 const revisedText = typeof args ==='string' ? args : args.revisedText;
 const availableCaseTypes = typeof args ==='string' ? [] : (args.availableCaseTypes ?? []);

 const formData = new FormData();
 formData.append("revisedText", revisedText);
 if (availableCaseTypes.length > 0) {
 formData.append("availableCaseTypesJson", JSON.stringify(availableCaseTypes));
 }

 const res = await api.post('/Ocr/generate-case', formData);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkGenerateCase;