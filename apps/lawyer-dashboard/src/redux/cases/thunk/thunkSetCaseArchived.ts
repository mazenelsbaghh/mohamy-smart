import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { TCase } from"../casesSlice";

type TArchiveCaseParams = {
 id: string | number;
 isArchived: boolean;
};

const thunkSetCaseArchived = createAsyncThunk<TCase, TArchiveCaseParams, { rejectValue: string }>(
 'cases/thunkSetCaseArchived',
 async ({ id, isArchived }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const action = isArchived ? 'archive' : 'restore';
 const res = await api.patch(`/Case/${id}/${action}`);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 });

export default thunkSetCaseArchived;
