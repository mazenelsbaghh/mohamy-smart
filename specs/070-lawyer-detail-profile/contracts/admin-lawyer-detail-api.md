# Contract: Admin Lawyer Detail API

## GET `/api/v1/lawyers/{id}`

Returns a complete admin-only lawyer detail profile for the existing admin lawyer detail screen.

### Authorization

- Requires authenticated admin user.
- Existing controller keeps `[Authorize(Roles = "Admin")]`.

### Path Parameters

- `id` (`guid`, required): Application user ID from the admin lawyers list route. The response includes `lawyerId` for lawyer-profile-specific links and actions.

### Success Response

Status: `200 OK`

```json
{
  "data": {
    "id": "5c3f7473-bd9e-4321-c2af-08dea86bfab3",
    "lawyerId": "a7dc41ec-41f0-49d4-b61e-651dc103f012",
    "fullName": "اسم المحامي",
    "email": "lawyer@example.com",
    "phoneNumber": "01000000000",
    "isActive": true,
    "phoneNumberConfirmed": true,
    "emailConfirmed": false,
    "userType": 2,
    "createdAt": "2026-04-01T10:00:00Z",
    "governorate": "القاهرة",
    "agreedToTerms": true,
    "barNumber": "12345",
    "specialization": "القانون المدني",
    "experienceNumber": "7",
    "lawFirmName": "مكتب المحامي",
    "birthDate": "1990-01-01",
    "lawyerProfileCreatedAt": "2026-04-01T10:02:00Z",
    "subscription": {
      "id": "8078260d-5e18-438f-8f7a-75cfd208d4f4",
      "planName": "Pro",
      "isActive": true,
      "startDate": "2026-04-01T00:00:00Z",
      "endDate": "2026-05-01T00:00:00Z",
      "durationDays": 30,
      "aiRequestsLimit": 100,
      "usedAiRequests": 12,
      "price": 500,
      "yearlyPrice": 5000
    },
    "activity": {
      "casesCount": 18,
      "activeCasesCount": 14,
      "clientsCount": 11,
      "powersOfAttorneyCount": 6,
      "activePowersOfAttorneyCount": 5,
      "reviewsCount": 4,
      "approvedReviewsCount": 3,
      "pendingReviewsCount": 1,
      "averageReviewRating": 4.5,
      "aiUsageCount": 22,
      "aiTotalTokens": 84321,
      "aiEstimatedCostUsd": 6.45,
      "lastActivityAt": "2026-05-01T13:30:00Z"
    },
    "recentCases": [
      {
        "id": "73189b9a-fc1a-4d5b-aad2-597f676400ab",
        "title": "دعوى تعويض",
        "number": "2026/45",
        "court": "محكمة جنوب القاهرة",
        "clientName": "اسم العميل",
        "status": 1,
        "created": "2026-05-01T13:30:00Z",
        "isActive": true
      }
    ],
    "recentSubscriptions": [],
    "recentReviews": [],
    "recentAiUsage": []
  },
  "message": "Lawyer detail retrieved successfully."
}
```

### Error Responses

- `400 Bad Request` or `404 Not Found`: User does not exist or no lawyer profile is linked.
- `401 Unauthorized`: User is not authenticated.
- `403 Forbidden`: Authenticated user is not an admin.

### Compatibility

- Existing fields from `UserToReturnDto` remain available in the new detail response using the same names where applicable.
- The frontend route `/lawyers/:id` continues to use the user ID from the lawyer list.
