import { createAsyncThunk } from"@reduxjs/toolkit";
import { axiosErrorHandler } from"@mohamy/shared-api";
import api from"../../../APIs/api";
import { ADMIN_ROUTES } from"../../../APIs/routes";

export type TOtpAuditEntry = {
 id: number;
 userName: string;
 purpose: string;
 deliveryChannel: string;
 maskedDestination: string;
 status: string;
 attemptCount: number;
 issuedAtUtc: string;
 consumedAtUtc: string | null;
 failureReason: string | null;
};

export type TEmailAuditEntry = {
 id: string;
 recipientEmail: string;
 eventType: string;
 deliveryStatus: string;
 sentAtUtc: string | null;
 failureReasonCategory: string | null;
 triggeredBy: string;
};

export type TAccountMessagingAudit = {
 totalOtpIssued: number;
 totalOtpVerified: number;
 totalOtpFailed: number;
 totalOtpLockedOut: number;
 totalEmailsSent: number;
 totalEmailsFailed: number;
 recentOtpEvents: TOtpAuditEntry[];
 recentEmailEvents: TEmailAuditEntry[];
};

const fetchAccountMessagingAudit = createAsyncThunk('reports/fetchAccountMessagingAudit',
 async (_, thunkAPI) => {
 const { rejectWithValue } = thunkAPI;
 try {
 const res = await api.get<{ data: TAccountMessagingAudit }>(`/${ADMIN_ROUTES.REPORTS.ACCOUNT_MESSAGING}`);
 return res.data.data;
 } catch (error) {
 return rejectWithValue(axiosErrorHandler(error));
 }
 }
);

export default fetchAccountMessagingAudit;
