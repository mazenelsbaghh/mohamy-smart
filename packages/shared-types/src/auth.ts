/** Authenticated user — shape returned after login / refresh (cookie-based, no tokens in state) */
export interface TUser {
  fullName: string;
  userId: string;
  profileId: string;
  phone: string;
  phoneNumberConfirmed?: boolean;
  requiresPhoneVerification?: boolean;
  roles: string[];
  dismissedGuidanceKeys?: string[];
}
