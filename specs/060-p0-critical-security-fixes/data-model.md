# Data Model: P0 — Emergency Critical Security Fixes

**Date**: 2026-04-23
**Feature**: `060-p0-critical-security-fixes`

## Schema Changes

**None.** This feature makes zero database schema changes. All modifications are to application logic (logging, error handling, file validation, frontend state initialization, and file deletions).

## Entities Modified (Logic Only)

### FileUploadService — New Validation Constants

| Field | Type | Description |
|-------|------|-------------|
| `AllowedExtensions` | `HashSet<string>` (static, case-insensitive) | Default: `.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png` |
| Sanitized filename | `string` | `Path.GetFileName(raw)` strips path traversal |

### ExceptionMiddleware — Response Change

| Scenario | Before | After |
|----------|--------|-------|
| HTTP status code for `DbUpdateException` | 400 (BadRequest) | 500 (InternalServerError) |
| Response body for `DbUpdateException` | SQL inner exception message | Generic: "A database error occurred. Please try again." |

### AuthService — Log Message Change

| Location | Before | After |
|----------|--------|-------|
| OTP generation (line 276) | Logs raw OTP code | Logs masked phone only |
| OTP verification (line 674) | Logs submitted code + validity | Logs masked phone + validity only |

### authSlice.ts (Admin + Lawyer) — Initialization Change

| Key | Before | After |
|-----|--------|-------|
| `"admin_user"` / `"user"` localStorage | `JSON.parse` without try-catch | `JSON.parse` with try-catch, removes corrupted data |
