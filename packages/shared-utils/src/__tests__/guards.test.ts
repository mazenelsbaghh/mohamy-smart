import { describe, it, expect } from 'vitest';
import { isString, isObject } from '../guards';

describe('isString', () => {
    it('returns true for a string', () => {
        expect(isString('hello')).toBe(true);
    });

    it('returns true for empty string', () => {
        expect(isString('')).toBe(true);
    });

    it('returns false for number', () => {
        expect(isString(42)).toBe(false);
    });

    it('returns false for null', () => {
        expect(isString(null)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isString(undefined)).toBe(false);
    });

    it('returns false for object', () => {
        expect(isString({})).toBe(false);
    });

    it('returns false for array', () => {
        expect(isString([])).toBe(false);
    });
});

describe('isObject', () => {
    it('returns true for a plain object', () => {
        expect(isObject({ key: 'value' })).toBe(true);
    });

    it('returns true for empty object', () => {
        expect(isObject({})).toBe(true);
    });

    it('returns false for null', () => {
        expect(isObject(null)).toBe(false);
    });

    it('returns false for array', () => {
        expect(isObject([])).toBe(false);
    });

    it('returns false for string', () => {
        expect(isObject('hello')).toBe(false);
    });

    it('returns false for number', () => {
        expect(isObject(42)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isObject(undefined)).toBe(false);
    });
});
