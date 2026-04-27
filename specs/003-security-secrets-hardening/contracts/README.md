# Contracts: Phase 2 — Security & Secrets Hardening

No new API endpoints are created in this feature. All changes are internal configuration
and startup behavior.

## CORS Behavior Contract

The following CORS behavior is the externally observable contract after this feature:

### Development Mode

| Request Origin | Response `Access-Control-Allow-Origin` | `Allow-Credentials` |
|---------------|---------------------------------------|---------------------|
| `http://localhost:5078` | `http://localhost:5078` | `true` |
| `http://localhost:5079` | `http://localhost:5079` | `true` |
| `http://localhost:3000` | `http://localhost:3000` | `true` |
| Any other origin | _(header absent — blocked)_ | _(absent)_ |

### Production Mode

| Request Origin | Response `Access-Control-Allow-Origin` | `Allow-Credentials` |
|---------------|---------------------------------------|---------------------|
| `https://mohamy-smart.com` | `https://mohamy-smart.com` | `true` |
| `https://app.mohamy-smart.com` | `https://app.mohamy-smart.com` | `true` |
| `https://admin.mohamy-smart.com` | `https://admin.mohamy-smart.com` | `true` |
| Any other origin | _(header absent — blocked)_ | _(absent)_ |

### Preflight (OPTIONS) Requests

All preflight requests from allowed origins receive:
- `Access-Control-Allow-Methods: *` (all methods)
- `Access-Control-Allow-Headers: *` (all headers, including `Authorization`)
- `Access-Control-Allow-Credentials: true`
- No authentication required for OPTIONS requests

## Startup Behavior Contract

| Condition | Behavior |
|-----------|----------|
| All config keys present and valid | Backend starts normally |
| Any key missing or placeholder | Exit code ≠ 0, error message lists ALL missing keys |
| JWT:Key < 32 chars | Exit code ≠ 0, error names the key and required length |
| CorsOrigins empty or missing | Exit code ≠ 0, error names the missing section |
| External service unreachable | Backend starts normally (no connectivity check) |
