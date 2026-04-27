import { describe, it, expect } from 'vitest';
import { normalizeDigits } from '../normalizeDigits';

describe('normalizeDigits', () => {
    it('leaves Western Arabic digits unchanged', () => {
        expect(normalizeDigits('0123456789')).toBe('0123456789');
    });

    it('converts Eastern Arabic digits to Western', () => {
        expect(normalizeDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    });

    it('converts Persian digits to Western', () => {
        expect(normalizeDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789');
    });

    it('handles mixed digits and non-digit characters', () => {
        expect(normalizeDigits('٠١٢-abc')).toBe('012-abc');
    });

    it('returns empty string unchanged', () => {
        expect(normalizeDigits('')).toBe('');
    });

    it('leaves non-digit characters unchanged', () => {
        expect(normalizeDigits('hello world')).toBe('hello world');
    });

    it('normalizes a phone number with Eastern Arabic digits', () => {
        expect(normalizeDigits('٠١٠١٢٣٤٥٦٧٨')).toBe('01012345678');
    });
});
