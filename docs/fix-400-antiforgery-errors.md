# Fix: 400 Bad Request Errors (Antiforgery/CSRF)

## Problem
After backend container restart, all POST/PUT/PATCH/DELETE requests return **400 Bad Request**.
This affects: OCR, AI Jobs, Appeal Brief, Admin Complaint, and all other state-changing endpoints.

## Root Cause
1. `AutoValidateAntiforgeryTokenAttribute` is applied globally (WebApplicationServices.cs:96)
2. After container restart, the XSRF-TOKEN cookie becomes stale or mismatched
3. The frontend CSRF retry logic checks response body for keywords ("csrf", "xsrf", "antiforgery") but ASP.NET returns 400 WITHOUT these keywords
4. Result: the retry never fires → user sees persistent 400 errors

## Fix
1. **Backend**: Add middleware to catch antiforgery failures and return identifiable error body
2. **Frontend**: Improve CSRF retry detection to also handle empty-body 400s on authenticated requests

## Status
- [x] Diagnosed
- [ ] Backend fix applied
- [ ] Frontend fix applied
- [ ] Tested
