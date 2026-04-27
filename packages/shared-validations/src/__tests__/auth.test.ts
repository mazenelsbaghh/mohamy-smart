import { describe, it, expect } from 'vitest';
import {
    lawyerLoginSchema,
    adminLoginSchema,
    signupSchema,
    forgotPasswordRequestSchema,
    verifyOtpSchema,
    resetPasswordSchema,
} from '../auth';

describe('lawyerLoginSchema', () => {
    it('validates correct input', () => {
        const result = lawyerLoginSchema.safeParse({
            phone: '01012345678',
            password: 'Test@1234',
        });
        expect(result.success).toBe(true);
    });

    it('rejects invalid phone', () => {
        const result = lawyerLoginSchema.safeParse({
            phone: '123',
            password: 'Test@1234',
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing password', () => {
        const result = lawyerLoginSchema.safeParse({
            phone: '01012345678',
            password: '',
        });
        expect(result.success).toBe(false);
    });
});

describe('adminLoginSchema', () => {
    it('validates correct input', () => {
        const result = adminLoginSchema.safeParse({
            email: 'admin@test.com',
            password: 'Test@1234',
        });
        expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
        const result = adminLoginSchema.safeParse({
            email: 'not-an-email',
            password: 'Test@1234',
        });
        expect(result.success).toBe(false);
    });

    it('rejects password shorter than 6 chars', () => {
        const result = adminLoginSchema.safeParse({
            email: 'admin@test.com',
            password: 'Ab@1',
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing fields', () => {
        const result = adminLoginSchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

describe('signupSchema', () => {
    const validSignup = {
        fullName: 'Test User',
        phoneNumber: '01012345678',
        email: 'test@example.com',
        password: 'Test@1234',
        passwordConfirmation: 'Test@1234',
        governorate: 'القاهرة',
        agreeToTerms: true,
    };

    it('validates correct input', () => {
        expect(signupSchema.safeParse(validSignup).success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
        const result = signupSchema.safeParse({
            ...validSignup,
            passwordConfirmation: 'Different@123',
        });
        expect(result.success).toBe(false);
    });

    it('rejects when terms not agreed', () => {
        const result = signupSchema.safeParse({
            ...validSignup,
            agreeToTerms: false,
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing fullName', () => {
        const { fullName, ...rest } = validSignup;
        expect(signupSchema.safeParse(rest).success).toBe(false);
    });
});

describe('forgotPasswordRequestSchema', () => {
    it('validates correct phone', () => {
        expect(forgotPasswordRequestSchema.safeParse({ phoneNumber: '01012345678' }).success).toBe(true);
    });

    it('rejects invalid phone', () => {
        expect(forgotPasswordRequestSchema.safeParse({ phoneNumber: 'abc' }).success).toBe(false);
    });
});

describe('verifyOtpSchema', () => {
    it('validates a 6-digit code', () => {
        expect(verifyOtpSchema.safeParse({ code: '123456' }).success).toBe(true);
    });

    it('rejects code shorter than 6 digits', () => {
        expect(verifyOtpSchema.safeParse({ code: '12345' }).success).toBe(false);
    });

    it('rejects code with non-digit chars', () => {
        expect(verifyOtpSchema.safeParse({ code: '12345a' }).success).toBe(false);
    });
});

describe('resetPasswordSchema', () => {
    it('validates matching passwords', () => {
        expect(resetPasswordSchema.safeParse({
            newPassword: 'Test@1234',
            confirmPassword: 'Test@1234',
        }).success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
        const result = resetPasswordSchema.safeParse({
            newPassword: 'Test@1234',
            confirmPassword: 'Different@1',
        });
        expect(result.success).toBe(false);
    });
});
