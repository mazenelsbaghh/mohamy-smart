import { createSlice } from"@reduxjs/toolkit";
import type { TLoading, TPaymentAttempt } from"../../types/types";
import { isString } from"@mohamy/shared-utils";
import thunkGetSubscriptionPlans from"./thunk/thunkGetSubscriptionPlans";
import thunkAddSubscriptionPlan from"./thunk/thunkAddSubscriptionPlan";
import thunkGetLawyerPlan from"./thunk/thunkGetLawyerPlan";
import thunkGetPaymentStatus from"./thunk/thunkGetPaymentStatus";
import type { TPaymentStatusResponse } from"./thunk/thunkGetPaymentStatus";
import thunkGetPaymentHistory from"./thunk/thunkGetPaymentHistory";
import thunkGetAiPointBalance from"./thunk/thunkGetAiPointBalance";
import thunkGetAiPointHistory from"./thunk/thunkGetAiPointHistory";
import type { AiPointBalance, AiPointTransaction } from"../aiJobs/aiPointTypes";

type TSubscriptionPlan = {
  id: number;
  name: string;
  features: string[] | null;
  price: number;
  aiRequestsLimit: number;
  durationDays: number;
  isPopular: boolean;
  yearlyPrice?: number | null;
  yearlyDurationDays?: number | null;
  hasYearlyOption?: boolean;
};
type TLawyerPlan = {
 lawyerId: string;
 lawyerName: string | null;
 planName: string;
 limit: number;
 isActive: boolean;
 usedAiRequests: number;
 endDate: string;
 startDate: string;
};

type TInitialState = {
 plans: TSubscriptionPlan[];
 lawyerPlan: TLawyerPlan | null;
 loading: TLoading;
 error: string | null;

 activePaymentUrl: string | null;
 activePaymentId: string | null;
 paymentStatus: TPaymentStatusResponse | null;
 paymentHistory: TPaymentAttempt[];
 aiPointBalance: AiPointBalance | null;
 aiPointHistory: AiPointTransaction[];
 paymentLoading: TLoading;
}

const initialState: TInitialState = {
 plans: [],
 lawyerPlan: null,
 loading:'idle',
 error: null,
 activePaymentUrl: null,
 activePaymentId: null,
 paymentStatus: null,
 paymentHistory: [],
 aiPointBalance: null,
 aiPointHistory: [],
 paymentLoading:'idle',
}

const subscriptionSlice = createSlice({
 name:'subscription',
 initialState,
 reducers: {
 clearActivePayment: (state) => {
 state.activePaymentUrl = null;
 state.activePaymentId = null;
 state.paymentStatus = null;
 }
 },
 extraReducers(builder) {
 builder
 // Get Subscription Plans
 .addCase(thunkGetSubscriptionPlans.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetSubscriptionPlans.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.plans = action.payload;
 })
 .addCase(thunkGetSubscriptionPlans.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })

 // get Lawyer Plan
 .addCase(thunkGetLawyerPlan.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetLawyerPlan.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.lawyerPlan = action.payload;
 })
 .addCase(thunkGetLawyerPlan.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })

 // post Subscribe To Plan (Initiate Payment)
 .addCase(thunkAddSubscriptionPlan.pending, (state) => {
 state.paymentLoading ='pending';
 state.error = null;
 })
 .addCase(thunkAddSubscriptionPlan.fulfilled, (state, action) => {
 state.paymentLoading ='succeeded';
 state.activePaymentId = action.payload.paymentId;
 state.activePaymentUrl = action.payload.paymentUrl;
 })
 .addCase(thunkAddSubscriptionPlan.rejected, (state, action) => {
 state.paymentLoading ='failed';
 if (isString(action.payload)) {
 state.error = action.payload;
 }
 })

 // get Payment Status
 .addCase(thunkGetPaymentStatus.pending, (state) => {
 state.paymentLoading ='pending';
 })
 .addCase(thunkGetPaymentStatus.fulfilled, (state, action) => {
 state.paymentLoading ='succeeded';
 state.paymentStatus = action.payload;
 })
 .addCase(thunkGetPaymentStatus.rejected, (state) => {
 state.paymentLoading ='failed';
 })

 // get Payment History
 .addCase(thunkGetPaymentHistory.pending, (state) => {
 state.loading ='pending';
 })
 .addCase(thunkGetPaymentHistory.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.paymentHistory = action.payload;
 })
 .addCase(thunkGetPaymentHistory.rejected, (state) => {
 state.loading ='failed';
 })

 // get AI point balance
 .addCase(thunkGetAiPointBalance.pending, (state) => {
 state.loading ='pending';
 state.error = null;
 })
 .addCase(thunkGetAiPointBalance.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.aiPointBalance = action.payload;
 })
 .addCase(thunkGetAiPointBalance.rejected, (state, action) => {
 state.loading ='failed';
 if (isString(action.payload)) state.error = action.payload;
 })

 // get AI point history
 .addCase(thunkGetAiPointHistory.pending, (state) => {
 state.loading ='pending';
 })
 .addCase(thunkGetAiPointHistory.fulfilled, (state, action) => {
 state.loading ='succeeded';
 state.aiPointHistory = action.payload;
 })
 .addCase(thunkGetAiPointHistory.rejected, (state) => {
 state.loading ='failed';
 });
 },
});

export const { clearActivePayment } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
