import DOMPurify from 'dompurify';

const SAFE_TAGS = [
  'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'p', 'br',
  'h1', 'h2', 'h3', 'h4', 'span', 'div',
  'table', 'tr', 'td', 'th', 'thead', 'tbody',
];
const SAFE_ATTRS = ['class', 'style', 'dir'];

/** Sanitize HTML using DOMPurify with a strict allowlist */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: SAFE_TAGS,
    ALLOWED_ATTR: SAFE_ATTRS,
  });
}

/** Check if sanitized HTML is effectively empty */
export function isSanitizedEmpty(html: string): boolean {
  const cleaned = sanitizeHtml(html);
  return cleaned.trim().length === 0;
}
