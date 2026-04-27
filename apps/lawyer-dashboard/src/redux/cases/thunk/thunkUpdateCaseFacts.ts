import { createAsyncThunk } from"@reduxjs/toolkit";
import api from"../../../APIs/api";
import { axiosErrorHandler } from"@mohamy/shared-api";
import type { RootState } from"../../store";

type UpdateCaseFactsArgs = {
 caseId: string;
 facts: string;
};

const thunkUpdateCaseFacts = createAsyncThunk('cases/thunkUpdateCaseFacts',
 async ({ caseId, facts }: UpdateCaseFactsArgs, { rejectWithValue, getState }) => {
 try {
 const singleCase = (getState() as RootState).cases.singleCase;
 const res = await api.put(`/Case/${caseId}`, {
 Title: singleCase?.title ??'',
 Number: singleCase?.number ??'',
 CaseTypeId: singleCase?.caseTypeId ?? 0,
 Status: singleCase?.status ?? 0,
 Court: singleCase?.court ??'',
 ClientName: singleCase?.clientName ??'',
 ApponentName: singleCase?.apponentName ??'',
 Description: singleCase?.description ??'',
 Facts: facts,
 LegalClaims: singleCase?.legalClaims ??'',
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default thunkUpdateCaseFacts;
