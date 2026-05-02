import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";

export type TUser = {
 id: string;
 fullName: string;
 email: string | null;
 phoneNumber: string | null;
 isActive: boolean;
 barNumber: string | null;
 specialization: string | null;
 experienceNumber: string | null;
 lawFirmName: string | null;
 lawyerId: string | null;
 subscriptionPlanName: string | null;
 subscriptionIsActive: boolean | null;
 numberOfCases: number;
};

export type TLawyerSubscriptionSummary = {
 id: string;
 planName: string | null;
 isActive: boolean;
 startDate: string;
 endDate: string;
 durationDays: number;
 aiRequestsLimit: number | null;
 usedAiRequests: number;
 price: number;
 yearlyPrice: number | null;
};

export type TLawyerActivitySummary = {
 casesCount: number;
 activeCasesCount: number;
 clientsCount: number;
 powersOfAttorneyCount: number;
 activePowersOfAttorneyCount: number;
 reviewsCount: number;
 approvedReviewsCount: number;
 pendingReviewsCount: number;
 averageReviewRating: number | null;
 aiUsageCount: number;
 aiTotalTokens: number;
 aiEstimatedCostUsd: number;
 lastActivityAt: string | null;
};

export type TRecentLawyerCase = {
 id: string;
 title: string;
 number: string;
 court: string;
 clientName: string;
 status: number;
 created: string;
 isActive: boolean;
};

export type TRecentLawyerReview = {
 id: string;
 reviewerName: string;
 reviewerRole: string | null;
 rating: number;
 status: string;
 comment: string;
 created: string;
};

export type TRecentLawyerAiUsage = {
 id: string;
 caseId: string | null;
 aiStepType: number;
 provider: string;
 modelIdentifier: string;
 totalTokens: number;
 estimatedCostUsd: number;
 createdAt: string;
};

export type TLawyerDetail = TUser & {
 phoneNumberConfirmed: boolean;
 emailConfirmed: boolean;
 userType: number;
 createdAt: string;
 governorate: string | null;
 agreedToTerms: boolean;
 birthDate: string | null;
 lawyerProfileCreatedAt: string | null;
 subscription: TLawyerSubscriptionSummary | null;
 activity: TLawyerActivitySummary;
 recentCases: TRecentLawyerCase[];
 recentSubscriptions: TLawyerSubscriptionSummary[];
 recentReviews: TRecentLawyerReview[];
 recentAiUsage: TRecentLawyerAiUsage[];
};

type TUsersResponse = {
 items: TUser[];
 totalPages: number;
 pageNumber: number;
 pageSize: number;
 totalCount: number;
};

type TUsersApiPayload = {
 data?: TUser[] | null;
 items?: TUser[] | null;
 totalPages?: number | null;
 pageNumber?: number | null;
 pageSize?: number | null;
 totalCount?: number | null;
 totalRecords?: number | null;
};

export const normalizeUsersResponse = (
 payload: TUsersApiPayload | null | undefined,
 fallbackPageNumber = 1,
 fallbackPageSize = 10,
): TUsersResponse => ({
 items: Array.isArray(payload?.items)
 ? payload.items
 : Array.isArray(payload?.data)
 ? payload.data
 : [],
 totalPages: payload?.totalPages ?? 1,
 pageNumber: payload?.pageNumber ?? fallbackPageNumber,
 pageSize: payload?.pageSize ?? fallbackPageSize,
 totalCount: payload?.totalCount ?? payload?.totalRecords ?? 0,
});

const fetchLawyers = createAsyncThunk<
 TUsersResponse,
 { pageNumber?: number; pageSize?: number } | undefined,
 { rejectValue: string }
>("lawyers/fetchLawyers",
 async (params = {}, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const pageNumber = params.pageNumber || 1;
 const pageSize = params.pageSize || 10;

 const res = await api.get<{ data: TUsersApiPayload }>("/Account/users", {
 params: {
 userType: 2,
 pageNumber,
 pageSize,
 },
 });

 return normalizeUsersResponse(res.data.data, pageNumber, pageSize);
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchLawyers;
