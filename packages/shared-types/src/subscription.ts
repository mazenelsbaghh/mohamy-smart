/** Subscription plan definition */
export interface TSubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  aiRequestsLimit: number;
  features: string[];
  yearlyPrice?: number | null;
  yearlyDurationDays?: number | null;
  hasYearlyOption?: boolean;
}

/** Active subscription status */
export interface TSubscriptionStatus {
  lawyerSubscriptionId: string;
  planId: number;
  planName: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  usedAiRequests: number;
  limit: number;
}

/** Payment attempt record */
export interface TPaymentAttempt {
  paymentId: string;
  amount: number;
  paymentMethod: 'card' | 'wallet';
  status: 'Pending' | 'Success' | 'Failed' | 'Expired';
  createdAt: string;
  paymentUrl?: string;
  subscriptionActivated?: boolean;
  activePlanName?: string;
}
