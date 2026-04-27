# API Contract: Validation Error Responses

**Branch**: `061-p1-backend-fixes` | **Date**: 2026-04-23

## Overview

Adding FluentValidation to existing DTOs changes the API response format for invalid requests. Currently, invalid data either silently passes through or causes unhandled exceptions. After this change, all validation errors return a structured 400 Bad Request response.

## Existing Endpoints Affected

### POST /api/case — Create Case

**Current behavior**: Accepts any data, may throw exceptions downstream.
**New behavior**: Returns 400 with field-level errors.

**Request validation errors**:
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Title": ["عنوان القضية مطلوب", "عنوان القضية يجب ألا يتجاوز 200 حرف"],
    "Number": ["رقم القضية مطلوب"],
    "Court": ["اسم المحكمة مطلوب"],
    "ClientName": ["اسم العميل مطلوب"]
  }
}
```

### PUT /api/case/{id} — Update Case

**Same validation rules as create**. Returns same error format.

### POST /api/client — Create Client

**Request validation errors**:
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "ClientName": ["اسم العميل مطلوب"],
    "PhoneNumber": ["رقم الهاتف مطلوب", "صيغة رقم الهاتف غير صحيحة"],
    "Email": ["صيغة البريد الإلكتروني غير صحيحة"],
    "NationalId": ["صيغة الرقم القومي غير صحيحة"]
  }
}
```

### PUT /api/client/{id} — Update Client

**Same validation rules as create**.

### POST /api/account/change-password — Change Password

**Request validation errors**:
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "CurrentPassword": ["كلمة المرور الحالية مطلوبة"],
    "NewPassword": ["كلمة المرور الجديدة مطلوبة", "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل"],
    "ConfirmPassword": ["تأكيد كلمة المرور غير متطابق"],
    "OtpCode": ["رمز التحقق مطلوب"]
  }
}
```

### POST /api/contact — Submit Contact Request

**Request validation errors**:
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": ["الاسم مطلوب"],
    "Phone": ["رقم الهاتف مطلوب", "صيغة رقم الهاتف غير صحيحة"],
    "Message": ["الرسالة مطلوبة", "الرسالة يجب ألا تتجاوز 1000 حرف"]
  }
}
```

### POST /api/payment/initiate — Initiate Payment

**Query parameter validation** (paymentMethod):

**Current behavior**: Accepts any string, passes to Paymob API which may fail.
**New behavior**: Returns 400 if paymentMethod is not "card" or "wallet".

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "paymentMethod": ["طريقة الدفع غير صالحة. يجب أن تكون 'card' أو 'wallet'"]
  }
}
```

## No Breaking Changes

All existing successful responses remain identical. Only previously-accepted invalid requests now return 400 instead of 500 or silent corruption. This is a **strictly additive** change — any client that was sending valid data is unaffected.

## Pagination Behavior Change

### All Paginated Endpoints

**Before**: `pageSize` could be any value (0, -1, 10000).
**After**: `pageSize` is clamped to range [1, 100]. Values ≤ 0 default to 10. Values > 100 are capped at 100.

This is not a breaking change — responses are the same format, just with a bounded page size.
