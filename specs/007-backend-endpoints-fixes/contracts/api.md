# API Contracts: Admin Endpoints

The following REST endpoints will be exposed from the `.NET` web server specifically to serve the Admin Dashboard payloads.

All endpoints require the Authorization header containing a Bearer token with the `Admin` role.

### 1. Layers Report

- **Endpoint**: `GET /api/reports/lawyers`
- **Security**: `[Authorize(Roles = "Admin")]`
- **Response** (200 OK):
  ```json
  {
    "totalLawyers": 150,
    "activeLawyers": 142,
    "suspendedLawyers": 8,
    "recentRegistrations": [
      { "id": "uuid", "name": "Ahmad", "joinedAt": "2026-04-03T...Z" }
    ]
  }
  ```

### 2. Subscriptions Report

- **Endpoint**: `GET /api/reports/subscriptions`
- **Security**: `[Authorize(Roles = "Admin")]`
- **Response** (200 OK):
  ```json
  {
    "totalRevenue": 45000.00,
    "activeSubscriptions": 120,
    "churnedSubscriptions": 5,
    "ledger": [
      { "transactionId": "tx_abc123", "amount": 150.00, "date": "2026-04-04T...Z", "status": "Paid" }
    ]
  }
  ```

### 3. Update Lawyer Status

- **Endpoint**: `PATCH /api/lawyers/{id}/status`
- **Security**: `[Authorize(Roles = "Admin")]`
- **Request Body**:
  ```json
  {
    "isActive": false
  }
  ```
- **Response** (200 OK): `{"message": "Lawyer status updated successfully"}`
- **Response** (404 Not Found): If lawyer doesn't exist.

### 4. Update Subscription Plan

- **Endpoint**: `PUT /api/plans/{id}`
- **Security**: `[Authorize(Roles = "Admin")]`
- **Request Body**:
  ```json
  {
    "name": "Premium Tier",
    "price": 200.00,
    "maxClients": 100
  }
  ```
- **Response** (200 OK): Contains the updated Plan entity JSON.
