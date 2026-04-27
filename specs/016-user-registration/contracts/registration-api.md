# API Contract: User Registration

## `POST /api/auth/register`

Creates a new user account in the system.

### Request Body (JSON)

```json
{
  "fullName": "Mazen Elsbagh",
  "mobileNumber": "01012345678",
  "email": "mazen@example.com",
  "password": "StrongPassword123!",
  "passwordConfirmation": "StrongPassword123!",
  "governorate": "Cairo",
  "agreeToTerms": true
}
```

### Response: `200 OK` (or `201 Created`)

```json
{
  "message": "User registered successfully.",
  "userId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
}
```

### Response: `400 Bad Request`

Returned for validation errors, missing fields, or password mismatch.

```json
{
  "errors": {
    "Email": ["Invalid email format."],
    "PasswordConfirmation": ["Passwords do not match."],
    "AgreeToTerms": ["You must agree to the terms and conditions."]
  }
}
```

### Response: `409 Conflict`

Returned when the email or mobile number is already in use.

```json
{
  "error": "A user with this Email or Mobile Number already exists."
}
```
