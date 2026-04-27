export const API_ROUTES = {
 // Authentication & Session
 AUTH_REGISTER:'/Auth/register',
 AUTH_LOGIN:'/Auth/login',
 AUTH_REQUEST_PHONE_VERIFICATION:'/Auth/request-phone-verification',
 AUTH_VERIFY_PHONE_NUMBER:'/Auth/verify-phone-number',
 AUTH_FORGOT_PASSWORD:'/Auth/forget-password',
 AUTH_VERIFY_OTP:'/Auth/verify-otp',
 AUTH_RESET_PASSWORD:'/Auth/reset-password',
 AUTH_REFRESH:'/Auth/refresh-token',
 
 // Account & Profile
 GET_PROFILE:'/account/profile',
 UPDATE_PROFILE:'/account/profile',
 CHANGE_PASSWORD:'/account/change-password',
 ACCOUNT_REQUEST_OTP:'/account/request-otp',
 ACCOUNT_VERIFY_OTP:'/account/verify-otp',
 
 // Subscription & Payment
 GET_SUBSCRIPTION_PLANS:'/subscription',
 GET_LAWYER_SUBSCRIPTION:'/subscription/lawyer',
 INITIATE_PAYMENT:'/payment/initiate', // Needs ?subscriptionId={planId}&paymentMethod={card|wallet}
 GET_PAYMENT_STATUS: (paymentId: string) => `/payment/status/${paymentId}`,
 GET_PAYMENT_HISTORY:'/payment/history',
 
 // Documents
 GET_DOCUMENTS:'/documents',
 
 // Legal Contracts
 GET_LEGAL_CONTRACTS:'/LegalContracts',
 GET_LEGAL_CONTRACT_TYPES:'/LegalContracts/types',
 CREATE_LEGAL_CONTRACT:'/LegalContracts',
 GET_LEGAL_CONTRACT_DETAILS: (id: string) => `/LegalContracts/${id}`,

 // AI Chat
 SEND_CHAT_MESSAGE:'/smartanalysis/chat'
};
