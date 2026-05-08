import { describe, it, expect } from 'vitest';
import { passwordSchema, emailSchema, phoneSchema } from '../common';

describe('passwordSchema', () => {
    it('accepts a valid strong password', () => {
        expect(passwordSchema.safeParse('Test@1234').success).toBe(true);
    });

    it('rejects empty string', () => {
        expect(passwordSchema.safeParse('').success).toBe(false);
    });

    it('rejects password shorter than 8 chars', () => {
        expect(passwordSchema.safeParse('Ab@1').success).toBe(false);
    });

    it('rejects password longer than 30 chars', () => {
        expect(passwordSchema.safeParse('A'.repeat(28) + '@1a').success).toBe(false);
    });

    it('rejects password without uppercase letter', () => {
        expect(passwordSchema.safeParse('test@1234').success).toBe(false);
    });

    it('rejects password without lowercase letter', () => {
        expect(passwordSchema.safeParse('TEST@1234').success).toBe(false);
    });

    it('rejects password without digit', () => {
        expect(passwordSchema.safeParse('Test@test').success).toBe(false);
    });

    it('rejects password without special character', () => {
        expect(passwordSchema.safeParse('Test1234').success).toBe(false);
    });

    it('accepts various special characters', () => {
        const specials = ['@', '$', '!', '%', '*', '?', '&', '#', '+', '-', '_', '.'];
        for (const ch of specials) {
            expect(passwordSchema.safeParse(`Test${ch}123`).success).toBe(true);
        }
    });
});

describe('emailSchema', () => {
    it('accepts valid email', () => {
        expect(emailSchema.safeParse('user@example.com').success).toBe(true);
    });

    it('rejects empty string', () => {
        expect(emailSchema.safeParse('').success).toBe(false);
    });

    it('rejects missing @', () => {
        expect(emailSchema.safeParse('userexample.com').success).toBe(false);
    });

    it('rejects missing domain', () => {
        expect(emailSchema.safeParse('user@').success).toBe(false);
    });
});

describe('phoneSchema', () => {
    it('accepts valid Egyptian phone starting with 010', () => {
        expect(phoneSchema.safeParse('01012345678').success).toBe(true);
    });

    it('accepts valid Egyptian phone starting with 011', () => {
        expect(phoneSchema.safeParse('01112345678').success).toBe(true);
    });

    it('accepts valid Egyptian phone starting with 012', () => {
        expect(phoneSchema.safeParse('01212345678').success).toBe(true);
    });

    it('accepts valid Egyptian phone starting with 015', () => {
        expect(phoneSchema.safeParse('01512345678').success).toBe(true);
    });

    it('accepts international format +20', () => {
        expect(phoneSchema.safeParse('+201012345678').success).toBe(true);
    });

    it('rejects empty string', () => {
        expect(phoneSchema.safeParse('').success).toBe(false);
    });

    it('rejects phone starting with 016', () => {
        expect(phoneSchema.safeParse('01612345678').success).toBe(false);
    });

    it('rejects phone that is too short', () => {
        expect(phoneSchema.safeParse('0101234').success).toBe(false);
    });

    it('rejects phone that is too long', () => {
        expect(phoneSchema.safeParse('010123456789').success).toBe(false);
    });
});
