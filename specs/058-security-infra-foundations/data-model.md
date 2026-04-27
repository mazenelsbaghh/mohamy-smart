# Data Model: Security & Infrastructure Foundations

**Feature**: `058-security-infra-foundations`  
**Date**: 2026-04-22  
**Status**: Complete

## Overview

This feature introduces **no database schema changes**. All modifications are in:
- Frontend utility code (sanitization)
- CI/CD configuration (workflows)
- TypeScript configuration (tsconfig)
- Environment documentation (.env.example)

## Entities

### Sanitization Utility (New — Frontend Code)

| Field/Function | Type | Description |
|----------------|------|-------------|
| `sanitizeHtml(html)` | `(string) → string` | Strips dangerous HTML tags/attributes, preserves safe formatting |
| `isSanitizedEmpty(html)` | `(string) → boolean` | Returns true if sanitization produces empty/whitespace-only content |
| `SAFE_TAGS` | `string[]` | Allowlist of HTML tags: b, i, em, strong, ul, ol, li, p, br, h1-h4, span, div, table elements |
| `SAFE_ATTRS` | `string[]` | Allowlist of HTML attributes: class, style, dir |

### Environment Validation Schema (New — Frontend Code)

| Variable | Type | Required | Validation |
|----------|------|----------|------------|
| `VITE_API_BASE_URL` | `string` | ✅ Yes | Must be a valid URL; must start with `https://` in production |
| `VITE_SENTRY_DSN` | `string` | ❌ Optional | Must be a valid `https://` URL if provided; empty string disables Sentry |
| `NEXT_PUBLIC_API_BASE_URL` | `string` | ✅ Yes (Landing) | Same rules as `VITE_API_BASE_URL` for Next.js environment |

### CI Pipeline Structure (Enhanced — Configuration)

| Job | Steps (After Enhancement) |
|-----|--------------------------|
| `backend` | checkout → setup .NET → restore → build → test (unchanged) |
| `lawyer-dashboard` | checkout → setup Node 22 → npm ci → **lint** → **type-check** → build → **npm audit** |
| `admin-dashboard` | checkout → setup Node 22 → npm ci → **lint** → **type-check** → build → **npm audit** |
| `landing` | checkout → setup Node 22 → npm ci → **lint** → **type-check** → build → **npm audit** |

Bold = new steps being added.

## State Transitions

N/A — no stateful entities introduced.

## Validation Rules

1. **Sanitization**: All dynamic HTML MUST pass through `sanitizeHtml()` before `dangerouslySetInnerHTML`.
2. **HTTPS**: API base URL MUST start with `https://` in production; HTTP only allowed for localhost.
3. **TypeScript**: No `any` type annotations — use `unknown` with type guards for truly dynamic data.
4. **Sentry DSN**: Must be a valid `https://` URL or empty string (not `TODO*` prefix).
