import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { TContactRequest } from"../contactSlice";
import { showSuccessToast } from"../../../utils/toastHelpers";

type TUpdateContactParams = {
 id: string;
 status: string;
};

const updateContactStatus = createAsyncThunk<TContactRequest, TUpdateContactParams, { rejectValue: string }>("contacts/updateContactStatus",
 async (params, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.patch<{ data: TContactRequest }>(
 `/Contact/${params.id}/status`,
 { status: params.status }
 );
 showSuccessToast("تم تحديث حالة الطلب بنجاح");
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default updateContactStatus;
