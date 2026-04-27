import { describe, it, expect } from 'vitest';
import { sanitizeHtml, isSanitizedEmpty } from '../sanitizeHtml';

describe('sanitizeHtml', () => {
    it('allows safe tags (b, i, p, etc.)', () => {
        const html = '<p>Hello <b>world</b></p>';
        expect(sanitizeHtml(html)).toBe('<p>Hello <b>world</b></p>');
    });

    it('strips script tags', () => {
        const html = '<p>Hello</p><script>alert("xss")</script>';
        expect(sanitizeHtml(html)).toBe('<p>Hello</p>');
    });

    it('strips iframe tags', () => {
        const html = '<iframe src="evil.com"></iframe><p>Safe</p>';
        expect(sanitizeHtml(html)).toBe('<p>Safe</p>');
    });

    it('strips onclick attributes', () => {
        const html = '<p onclick="alert(1)">Click</p>';
        expect(sanitizeHtml(html)).toBe('<p>Click</p>');
    });

    it('allows class and style attributes', () => {
        const html = '<p class="text" style="color:red;">Hi</p>';
        expect(sanitizeHtml(html)).toBe('<p class="text" style="color:red;">Hi</p>');
    });

    it('allows table tags', () => {
        const result = sanitizeHtml('<table><tr><td>Cell</td></tr></table>');
        expect(result).toContain('<table>');
        expect(result).toContain('<tr>');
        expect(result).toContain('<td>Cell</td>');
        expect(result).toContain('</table>');
    });

    it('returns empty string for empty input', () => {
        expect(sanitizeHtml('')).toBe('');
    });
});

describe('isSanitizedEmpty', () => {
    it('returns true for empty string', () => {
        expect(isSanitizedEmpty('')).toBe(true);
    });

    it('returns true for whitespace-only string', () => {
        expect(isSanitizedEmpty('   ')).toBe(true);
    });

    it('returns true for content that gets stripped entirely', () => {
        expect(isSanitizedEmpty('<script>alert(1)</script>')).toBe(true);
    });

    it('returns false for valid content', () => {
        expect(isSanitizedEmpty('<p>Hello</p>')).toBe(false);
    });

    it('returns false for plain text', () => {
        expect(isSanitizedEmpty('Some text')).toBe(false);
    });
});
