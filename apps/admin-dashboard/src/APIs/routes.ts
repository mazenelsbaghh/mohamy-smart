export const ADMIN_ROUTES = {
 ACCOUNT: {
 PROFILE:"Account/profile",
 CHANGE_PASSWORD:"Account/change-password",
 },
 NOTIFICATION: {
 BASE:"Notification",
 READ_ALL:"Notification/read-all",
 READ: (id: string | number) => `Notification/${id}/read`,
 DELETE: (id: string | number) => `Notification/${id}`,
 },
 AI_MODEL_CONFIG: {
 BASE:"AiModelConfig",
 MODELS:"AiModelConfig/models",
 STAGES:"AiModelConfig/stages",
 },
 AI_USAGE: {
 SUMMARY:"ai-usage/summary",
 LAWYERS:"ai-usage/lawyers",
 LAWYER_DETAIL: (id: string) => `ai-usage/lawyers/${id}`,
 MODELS:"ai-usage/models",
 },
 SUBSCRIPTION_DETAIL: (id: string) => `Subscription/${id}`,
 REVIEWS:"Review",
 REVIEW_STATUS: (id: string) => `Review/${id}/status`,
 SUBSCRIPTIONS_CHART:"admin/reports/subscriptions-chart",
 LAWYER_DETAIL: (id: string) => `Subscription/lawyers/${id}`,
 REPORTS: {
 ACCOUNT_MESSAGING:"admin/reports/account-messaging",
 },
};
