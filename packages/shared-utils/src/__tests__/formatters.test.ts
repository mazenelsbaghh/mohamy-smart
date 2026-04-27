import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from '../formatters';

describe('formatDate', () => {
    it('returns "-" for null', () => {
        expect(formatDate(null)).toBe('-');
    });

    it('returns "-" for undefined', () => {
        expect(formatDate(undefined)).toBe('-');
    });

    it('returns "-" for empty string', () => {
        expect(formatDate('')).toBe('-');
    });

    it('returns "-" for invalid date string', () => {
        expect(formatDate('not-a-date')).toBe('-');
    });

    it('formats a valid ISO date string', () => {
        const result = formatDate('2025-06-15T00:00:00Z');
        expect(result).not.toBe('-');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('formatCurrency', () => {
    it('returns "-" for null', () => {
        expect(formatCurrency(null)).toBe('-');
    });

    it('returns "-" for undefined', () => {
        expect(formatCurrency(undefined)).toBe('-');
    });

    it('formats a positive amount', () => {
        const result = formatCurrency(1000);
        expect(result).not.toBe('-');
        expect(typeof result).toBe('string');
    });

    it('formats zero', () => {
        const result = formatCurrency(0);
        expect(result).not.toBe('-');
    });

    it('formats a negative amount', () => {
        const result = formatCurrency(-500);
        expect(result).not.toBe('-');
    });
});
