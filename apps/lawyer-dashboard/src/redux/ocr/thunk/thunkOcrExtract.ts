import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";

type TOcrResponse = {
 data: string[];
};

type TOcrExtractInput = File | File[] | {
 files: File[];
 signal?: AbortSignal;
 onUploadProgress?: (progress: { loaded: number; total?: number; percent?: number }) => void;
};

const normalizeInput = (input: TOcrExtractInput) => {
 if (input instanceof File) return { files: [input] };
 if (Array.isArray(input)) return { files: input };
 return input;
};

const thunkOcrExtract = createAsyncThunk<string[], TOcrExtractInput, { rejectValue: string }>('ocr/thunkOcrExtract',
 async (inputFiles, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const { files, signal, onUploadProgress } = normalizeInput(inputFiles);
 const formData = new FormData();
 files.forEach((file) => {
 formData.append('Images', file, file.name ||'document.pdf');
 });

 const res = await api.post<TOcrResponse>('/Ocr/ocr', formData, {
 signal,
 onUploadProgress: (event) => {
 if (!onUploadProgress) return;
 const total = event.total || undefined;
 onUploadProgress({
 loaded: event.loaded,
 total,
 percent: total ? Math.round((event.loaded / total) * 100) : undefined,
 });
 },
 });
 return res.data.data ?? [];
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkOcrExtract;
