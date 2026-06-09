import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@mohamy/shared-api";
import api from "../../../APIs/api";

export type TLawyerCasesStats = {
  lawyerId: string;
  fullName: string;
  phoneNumber: string | null;
  casesCount: number;
  completedStepsCount: number;
  workflowVersionsCount: number;
};

export type TGetLawyerCasesStatsParams = {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
};

export type TPagedLawyerCasesStats = {
  items: TLawyerCasesStats[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const fetchLawyerCasesStats = createAsyncThunk(
  'reports/fetchLawyerCasesStats',
  async (params: TGetLawyerCasesStatsParams, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const res = await api.get<{ data: TPagedLawyerCasesStats }>('/admin/reports/lawyers-cases-stats', {
        params
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(axiosErrorHandler(error));
    }
  }
);

export default fetchLawyerCasesStats;
