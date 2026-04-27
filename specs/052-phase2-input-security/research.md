# Phase 0: Research & Technical Decisions

## 1. Virus Scanning Integration
**Decision**: Use `nClam` library in the .NET Backend to communicate with a `clamav/clamav` Docker container.
**Rationale**: `nClam` is lightweight and connects directly to the `clamd` daemon over TCP, making it fast and suitable for the Docker-compose environment. Adding a ClamAV container aligns with the Docker infrastructure consistency principle.
**Alternatives considered**: Using an external API (e.g., VirusTotal), which could introduce data privacy concerns for sensitive legal documents.

## 2. API Rate Limiting
**Decision**: Implement .NET 9 built-in Rate Limiting (`Microsoft.AspNetCore.RateLimiting`).
**Rationale**: Native to the framework, highly performant, supports sliding windows, fixed windows, and token buckets. It can be easily mapped to specific AI and OCR endpoints using `[EnableRateLimiting("AiEndpoints")]` attributes.
**Alternatives considered**: `AspNetCoreRateLimit` library, which is now largely obsolete since .NET 7 introduced native support.

## 3. Hangfire Dashboard Security
**Decision**: Create a custom `HangfireAuthorizationFilter` implementing `IDashboardAuthorizationFilter`.
**Rationale**: By default, Hangfire Dashboard blocks remote requests. To allow access via the Admin Dashboard or remote admins, we must validate the request. The filter will extract the JWT from a cookie or query string (since Hangfire UI is rendered server-side and doesn't naturally send Authorization headers) and validate the `Admin` role.
**Alternatives considered**: Basic Authentication (`Hangfire.Dashboard.BasicAuthorization`), which creates a parallel credential system violating the unified Identity system.

## 4. Frontend DOM Sanitization
**Decision**: Use the `dompurify` npm package in both Lawyer and Admin dashboards.
**Rationale**: Industry standard for preventing XSS. It cleanly strips malicious tags/attributes while preserving legitimate HTML output from the backend.
**Alternatives considered**: Built-in React escaping (not sufficient when `dangerouslySetInnerHTML` is required for rich text AI outputs).

## 5. File Upload Validation
**Decision**: Implement a custom `[AllowedExtensions]` and `[MaxFileSize]` validation attribute for DTOs in `Lawyer.Application`. Additionally, perform strict MIME-type sniffing (Magic Numbers) before processing.
**Rationale**: Attributes provide clean, declarative validation that integrates with ASP.NET Core `ModelState`. Magic number checking prevents extension spoofing.
**Alternatives considered**: Doing validation directly in the Controller, which violates Clean Architecture.
