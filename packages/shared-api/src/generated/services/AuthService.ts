/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ForgetPasswordDto } from '../models/ForgetPasswordDto';
import type { RefreshTokenRequest } from '../models/RefreshTokenRequest';
import type { RegisterDto } from '../models/RegisterDto';
import type { RequestPhoneVerificationDto } from '../models/RequestPhoneVerificationDto';
import type { ResetPasswordDto } from '../models/ResetPasswordDto';
import type { RevokeRefreshTokenRequest } from '../models/RevokeRefreshTokenRequest';
import type { VerifyOtpDto } from '../models/VerifyOtpDto';
import type { VerifyPhoneNumberDto } from '../models/VerifyPhoneNumberDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Returns the current user's profile from JWT claims — no DB call.
     * Used by route guards on app boot to hydrate Redux state.
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AuthMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Auth/me',
        });
    }
    /**
     * Refreshes the XSRF-TOKEN cookie and returns the header token value.
     * Call this once after login; Axios reads the cookie automatically thereafter.
     * @returns any OK
     * @throws ApiError
     */
    public static getApiV1AuthCsrfToken(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/Auth/csrf-token',
        });
    }
    /**
     * Revokes the refresh token server-side and expires all auth cookies.
     * Requires CSRF header (state-changing endpoint).
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/logout',
        });
    }
    /**
     * Register a new lawyer account.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthRegister(
        requestBody?: RegisterDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Authenticate a lawyer using phone number and password.
     * T012: Sets httpOnly session + refresh cookies on success.
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthLogin(
        formData?: {
            PhoneNumber?: string;
            Password?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/login',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Authenticate an admin using email and password.
     * T013: Sets httpOnly session + refresh cookies on success.
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthAdminLogin(
        formData?: {
            Email?: string;
            Password?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/admin/login',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Send or resend phone verification OTP after registration.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthRequestPhoneVerification(
        requestBody?: RequestPhoneVerificationDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/request-phone-verification',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Confirm the phone number with an OTP after registration.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthVerifyPhoneNumber(
        requestBody?: VerifyPhoneNumberDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/verify-phone-number',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Initiate password reset by sending OTP to the registered phone number.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthForgetPassword(
        requestBody?: ForgetPasswordDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/forget-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Verify a one-time password (OTP) for password reset.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthVerifyOtp(
        requestBody?: VerifyOtpDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/verify-otp',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Set a new password after OTP verification.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthResetPassword(
        requestBody?: ResetPasswordDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Exchange a refresh token for a new access token.
     * Reads from the refresh cookie if present; falls back to body for server-to-server clients.
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthRefreshToken(
        requestBody?: RefreshTokenRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/refresh-token',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Revoke a refresh token to force re-authentication.
     * Reads from cookie or body; requires CSRF token (authenticated state-changing endpoint).
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiV1AuthRevokeRefreshToken(
        requestBody?: RevokeRefreshTokenRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/Auth/revoke-refresh-token',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
