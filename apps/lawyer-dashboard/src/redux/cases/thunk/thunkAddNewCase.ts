import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import { normalizeDigits } from"@mohamy/shared-utils";

type TCaseData = {
 caseTitle: string;
 caseNumber: string;
 CaseTypeIds: number[];
 court: string;
 clientName: string;
 opponentName: string;
 defendingParty: string;
 caseDescription: string;
 caseFacts: string;
 legalRequests: string;
 IsExistedClient: boolean,
 clientId: string,
 PowerOfAttorneyId?: string,
};

const thunkAddNewCase = createAsyncThunk('cases/thunkAddNewCase', async (data: TCaseData, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.post('/Case/create', {
 Title: data.caseTitle,
 Number: normalizeDigits(data.caseNumber),
 CaseTypeIds: data.CaseTypeIds,
 Court: data.court,
 ClientName: data.clientName,
 ApponentName: data.opponentName || undefined,
 DefendingParty: data.defendingParty ||'client',
 Description: data.caseDescription,
 Facts: data.caseFacts,
 LegalClaims: data.legalRequests,
 IsExistedClient: data.IsExistedClient,
 ClientId: data.clientId || undefined,
 PowerOfAttorneyId: data.PowerOfAttorneyId,
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkAddNewCase;
