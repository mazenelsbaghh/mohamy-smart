import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { TPhoneVerificationResult } from"./fetchLawyers";

type TVerifyLawyerPhonePayload = {
 id: string;
 reason: string;
};

const verifyLawyerPhoneManually = createAsyncThunk<
 TPhoneVerificationResult,
 TVerifyLawyerPhonePayload,
 { rejectValue: string }
>("lawyers/verifyLawyerPhoneManually",
 async ({ id, reason }, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.patch<{ data: TPhoneVerificationResult }>(
 `/lawyers/${id}/phone-verification`,
 { reason },
 );
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default verifyLawyerPhoneManually;
