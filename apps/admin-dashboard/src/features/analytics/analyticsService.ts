import api from'../../APIs/api';

export interface FinancialMetricsDto {
 totalRevenue: number;
 monthlyRecurringRevenue: number;
 totalRefunds: number;
 averageRevenuePerUser: number;
}

export interface SubscriptionLifecycleDto {
 totalNewSubscribers: number;
 oneMonthChurners: number;
 renewals: number;
 upgrades: number;
 refunds: number;
}

export interface UserEngagementDto {
 dailyActiveUsers: number;
 monthlyActiveUsers: number;
 dormantUsers: number;
 powerUsersCount: number;
}

export interface CohortDataDto {
 cohortMonth: string;
 totalUsers: number;
 retentionRates: Record<string, number>;
}

const getFinancialMetrics = async (): Promise<FinancialMetricsDto> => {
 const response = await api.get('/analytics/financial');
 return response.data?.data ?? response.data;
};

const getSubscriptionMetrics = async (): Promise<SubscriptionLifecycleDto> => {
 const response = await api.get('/analytics/subscriptions');
 return response.data?.data ?? response.data;
};

const getEngagementMetrics = async (): Promise<UserEngagementDto> => {
 const response = await api.get('/analytics/engagement');
 return response.data?.data ?? response.data;
};

const getCohortMetrics = async (): Promise<CohortDataDto[]> => {
 const response = await api.get('/analytics/cohorts');
 const result = response.data?.data ?? response.data;
 return Array.isArray(result) ? result : [];
};

const analyticsService = {
 getFinancialMetrics,
 getSubscriptionMetrics,
 getEngagementMetrics,
 getCohortMetrics,
};

export default analyticsService;
