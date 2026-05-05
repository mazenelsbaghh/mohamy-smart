import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import type { RootState } from"../../store";
import type { TCase } from"../casesSlice";

type TUpdateCaseData = {
 id: string;
 title: string;
 number: string;
 caseTypeIds: number[];
 status: TCase['status'];
 court: string;
 clientName: string;
 apponentName: string;
 description: string;
 facts: string;
 legalClaims: string;
 powerOfAttorneyId?: string | null;
 internalRegulationIds?: string[];
 creationDate?: string;
};

const thunkUpdateCase = createAsyncThunk('cases/thunkUpdateCase', async (data: TUpdateCaseData, thunkAPI) => {
 const { rejectWithValue, getState } = thunkAPI;
 try {
 const currentCase = (getState() as RootState).cases.singleCase;
 const res = await api.put(`/Case/${data.id}`, {
 Title: data.title,
 Number: data.number,
 CaseTypeIds: data.caseTypeIds,
 Status: data.status,
 Court: data.court,
 ClientName: data.clientName,
 ApponentName: data.apponentName,
 Description: data.description,
 Facts: data.facts,
 LegalClaims: data.legalClaims,
 PowerOfAttorneyId: data.powerOfAttorneyId,
 InternalRegulationIds: data.internalRegulationIds ?? currentCase?.internalRegulations?.map((regulation) => regulation.id) ?? [],
 CreationDate: data.creationDate,
 });
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
});

export default thunkUpdateCase;
