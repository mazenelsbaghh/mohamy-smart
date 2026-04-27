/** Lawyer/Admin profile — same shape in both dashboards */
export interface TProfile {
  lawyerId: string;
  applicationUserId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  officeName: string | null;
  address: string | null;
}

/** Update profile payload */
export interface UpdateProfileDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  officeName: string | null;
  address: string | null;
}

/** Change password payload */
export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
