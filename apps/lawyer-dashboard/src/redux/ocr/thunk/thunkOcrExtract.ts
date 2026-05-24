import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

type TOcrResponse = {
 data: string[];
};

const thunkOcrExtract = createAsyncThunk<string[], File | File[], { rejectValue: string }>('ocr/thunkOcrExtract',
 async (inputFiles, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const files = Array.isArray(inputFiles) ? inputFiles : [inputFiles];
 const formData = new FormData();
 files.forEach((file) => {
 formData.append('Images', file, file.name ||'document.pdf');
 });

 const res = await api.post<TOcrResponse>('/Ocr/ocr', formData);
 return res.data.data ?? [];
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkOcrExtract;
