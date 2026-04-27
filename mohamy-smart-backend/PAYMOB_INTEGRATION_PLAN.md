# Paymob Integration Plan — Lawyer App (Pixel Button)

## Overview

Integrate **Paymob** as the payment gateway for lawyer subscription plans using the **Pixel Button** (embedded payment UI). Currently, subscriptions are assigned directly without payment validation. After integration, a lawyer must complete payment through Paymob before the subscription is activated.

**API Used:** Paymob **Intention API v1** (single-step) — NOT the older multi-step auth/order/payment-key flow.

### Project Architecture — Who Does What

| Layer | Tech | Responsibility |
|-------|------|----------------|
| **Backend (this project)** | .NET Web API | Creates Paymob intention, **returns the payment page as `text/html`** (a full HTML page containing the Pixel Button script + credentials). Handles both callbacks. Verifies HMAC. Activates subscriptions. |
| **Frontend (separate project)** | React SPA | Calls initiate endpoint, **renders the returned HTML inside a WebView** (iframe `src` or `srcdoc`). Shows success/failure pages after payment completes. |

**Why this approach:** The backend owns all Paymob knowledge (keys, scripts, UI). The frontend developer does not need to know anything about Paymob — they just render the HTML view the backend returns in a WebView.

---

## Current Flow (No Payment)

```
Lawyer selects plan --> POST /api/subscription --> Subscription activated immediately
```

## Target Flow (With Paymob)

```
Lawyer selects plan
    --> Frontend calls GET /api/v1/payment/initiate?subscriptionId=2&paymentMethod=card
    --> Backend creates Paymob Intention (single API call)
    --> Backend saves Payment record (Pending)
    --> Backend returns full HTML page (text/html) with Pixel Button embedded
    --> Frontend renders the HTML in a WebView/iframe
    --> Lawyer completes payment inside the Pixel Button UI
    --> Paymob sends two callbacks:
        1. GET  /api/v1/payment/callback          (browser redirect → backend redirects to frontend URL)
        2. POST /api/v1/payment/server-callback   (server-to-server → backend updates DB, activates sub)
    --> Frontend detects the redirect from callback or polls payment status endpoint
```

---

## Step-by-Step Implementation

### Step 1: Paymob Account Setup & Configuration

**What:** Gather credentials from Paymob dashboard.

**Required keys (store in `appsettings.json` + user-secrets for sensitive values):**

```json
"Paymob": {
  "APIKey": "",
  "SecretKey": "",
  "PublicKey": "",
  "HMAC": "",
  "CardIntegrationId": "",
  "MobileIntegrationId": ""
}
```

| Key | Purpose | Where Used |
|-----|---------|------------|
| `APIKey` | Paymob dashboard API key | Reserved for future use (not needed for Intention API) |
| `SecretKey` | Server-side auth for Intention API | `Authorization: Token <SecretKey>` header |
| `PublicKey` | Client-side key for Pixel Button | Returned to frontend, passed to Pixel Button |
| `HMAC` | Secret for verifying callback signatures | HMAC-SHA512 verification on callbacks |
| `CardIntegrationId` | Integration ID for card payments | Passed in `payment_methods` array |
| `MobileIntegrationId` | Integration ID for mobile wallet payments | Passed in `payment_methods` array |

**Where to find in Paymob Dashboard:**
- `SecretKey` / `APIKey` — Settings > Account Info
- `PublicKey` — Settings > Account Info
- `HMAC` — Developers > Webhooks
- Integration IDs — Developers > Payment Integrations

**Files to touch:**
- `Lawyer/appsettings.json` — add `Paymob` section

---

### Step 2: Create Payment Entities (Core Layer)

**What:** Add new models to track payment transactions.

**File:** `Lawyer.Core/Models/Payment.cs`

```csharp
public class Payment : BaseEntity<Guid>
{
    public Guid LawyerId { get; set; }
    public int SubscriptionId { get; set; }
    public decimal Amount { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public string Currency { get; set; } = "EGP";
    public string PaymentMethod { get; set; }           // "card" or "wallet"
    public string TransactionId { get; set; }            // special_reference / merchant_order_id (used to match callbacks)
    public string? PaymobTransactionId { get; set; }     // Paymob's transaction ID (from callback)
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    // Navigation
    public Lawyer Lawyer { get; set; }
    public Subscription Subscription { get; set; }
}
```

**File:** `Lawyer.Core/Enums/PaymentStatus.cs`

```csharp
public enum PaymentStatus
{
    Pending = 0,
    Success = 1,
    Failed = 2,
    Refunded = 3
}
```

**File:** `Lawyer.Infrastructure/Persistence/AppDbContext.cs`
- Add `DbSet<Payment> Payments { get; set; }`

**Then:** Add EF migration for the new `Payments` table.

---

### Step 3: Create Paymob Configuration Class

**File:** `Lawyer.Core/Settings/PaymobSettings.cs`

```csharp
public class PaymobSettings
{
    public string APIKey { get; set; }
    public string SecretKey { get; set; }
    public string PublicKey { get; set; }
    public string HMAC { get; set; }
    public string CardIntegrationId { get; set; }
    public string MobileIntegrationId { get; set; }
}
```

**File:** `Lawyer/Program.cs`
- Register: `builder.Services.Configure<PaymobSettings>(builder.Configuration.GetSection("Paymob"));`

---

### Step 4: Create Paymob Service (Application Layer)

**What:** Service that communicates with Paymob Intention API and handles callbacks.

**File:** `Lawyer.Application/IServices/IPaymobService.cs`

```csharp
public interface IPaymobService
{
    /// <summary>
    /// Creates Paymob intention and returns a full HTML page (text/html)
    /// containing the Pixel Button ready to render in a WebView.
    /// </summary>
    Task<Result<string>> ProcessPaymentAsync(
        Guid lawyerId, int subscriptionId, string paymentMethod, CancellationToken ct);

    Task<Result<string>> HandleServerCallbackAsync(string hmac, JsonElement payload, CancellationToken ct);

    string ComputeHmacSHA512(string data, string secret);
}
```

**File:** `Lawyer.Application/Services/PaymobService.cs`

#### `ProcessPaymentAsync` — Full Logic:

1. Validate lawyer exists (load with `ApplicationUser` for billing data).
2. Validate subscription plan exists and get its `Price`.
3. Generate `special_reference`:
   ```csharp
   var specialReference = RandomNumberGenerator.GetInt32(1000000, 9999999) + someUniqueId;
   ```
4. Convert amount to cents:
   ```csharp
   var amountCents = (int)(subscription.Price * 100);
   ```
5. Determine integration ID:
   ```csharp
   var integrationId = paymentMethod.ToLower() switch
   {
       "card"   => _settings.CardIntegrationId,
       "wallet" => _settings.MobileIntegrationId,
       _ => throw new ArgumentException("Invalid payment method. Use 'card' or 'wallet'.")
   };
   ```
6. Build the intention payload:
   ```json
   {
     "amount": 50000,
     "currency": "EGP",
     "payment_methods": [12345],
     "billing_data": {
       "apartment": "N/A",
       "first_name": "Ahmed",
       "last_name": "Hassan",
       "street": "N/A",
       "building": "N/A",
       "phone_number": "+201234567890",
       "country": "EG",
       "email": "ahmed@example.com",
       "floor": "N/A",
       "state": "N/A",
       "city": "N/A"
     },
     "items": [
       {
         "name": "Subscription Plan - Pro",
         "amount": 50000,
         "description": "Lawyer Subscription Payment for Pro plan",
         "quantity": 1
       }
     ],
     "customer": {
       "first_name": "Ahmed",
       "last_name": "Hassan",
       "email": "ahmed@example.com",
       "extras": { "lawyerId": "guid-here" }
     },
     "extras": {
       "lawyerId": "guid-here",
       "subscriptionId": 2
     },
     "special_reference": 1234567,
     "merchant_order_id": "1234567",
     "expiration": 3600
   }
   ```
7. Call Paymob Intention API:
   ```csharp
   var request = new HttpRequestMessage(HttpMethod.Post, "https://accept.paymob.com/v1/intention/");
   request.Headers.Authorization = new AuthenticationHeaderValue("Token", _settings.SecretKey);
   request.Content = JsonContent.Create(payload);

   var response = await _httpClient.SendAsync(request);
   var responseContent = await response.Content.ReadAsStringAsync();
   ```
8. Parse `client_secret` from response:
   ```csharp
   using var doc = JsonDocument.Parse(responseContent);
   var clientSecret = doc.RootElement.GetProperty("client_secret").GetString();
   ```
9. Save `Payment` record with `Status = Pending` and `TransactionId = specialReference`.
10. **Build and return the full HTML page** containing the Pixel Button:
   ```csharp
   var html = $@"
   <!DOCTYPE html>
   <html lang='en'>
   <head>
       <meta charset='UTF-8'>
       <meta name='viewport' content='width=device-width, initial-scale=1.0'>
       <title>Payment</title>
       <script src='https://accept.paymob.com/unifiedcheckout/v1/paymob-checkout.min.js'></script>
       <style>
           body {{ margin: 0; padding: 20px; font-family: Arial, sans-serif;
                   display: flex; justify-content: center; align-items: center;
                   min-height: 100vh; background: #f5f5f5; }}
           #payment-container {{ width: 100%; max-width: 500px; }}
       </style>
   </head>
   <body>
       <div id='payment-container'></div>
       <script>
           const checkout = new PaymobCheckout({{
               publicKey: '{_settings.PublicKey}',
               clientSecret: '{clientSecret}',
           }});
           checkout.render('payment-container');
       </script>
   </body>
   </html>";

   return Result<string>.Success(html);
   ```

> **Key point:** The backend returns a complete, self-contained HTML page. The frontend developer renders this in a WebView — they do not need to know anything about Paymob, keys, or scripts.

#### `HandleServerCallbackAsync` — Full Logic:

1. Extract `hmac` from query string.
2. Parse JSON body and navigate to `obj` element.
3. Extract the 20 HMAC fields from `obj` (see Step 7 for exact fields).
4. Verify HMAC (see Step 7).
5. Extract `merchant_order_id` from `obj.order.merchant_order_id`.
6. Find `Payment` record where `TransactionId == merchant_order_id`.
7. If `success == true`:
   - Update `Payment.Status = Success`.
   - Store Paymob's transaction ID.
   - Call `SubscriptionService.SubscribeAsync(lawyerId, subscriptionId)` to activate.
8. If `success == false`:
   - Update `Payment.Status = Failed`.
9. Save changes and return `Ok()`.

---

### Step 5: Create DTOs for Payment

**File:** `Lawyer.Application/Dtos/PaymentDto.cs`

```csharp
// Payment history item
public class PaymentHistoryDto
{
    public Guid Id { get; set; }
    public string PlanName { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; }
    public string PaymentMethod { get; set; }
    public string Status { get; set; }
    public DateTime PaymentDate { get; set; }
}

// Payment status check
public class PaymentStatusDto
{
    public Guid PaymentId { get; set; }
    public string Status { get; set; }       // "Pending", "Success", "Failed"
    public bool SubscriptionActivated { get; set; }
}
```

> **Note:** No request DTO is needed for the initiate endpoint — it uses query parameters. No response DTO is needed either — it returns `text/html` directly. No strongly-typed DTOs are needed for Paymob's callback response — use `System.Text.Json.JsonDocument` / `JsonElement` to parse the nested callback payload.

---

### Step 6: Create Payment Controller (API Layer)

**File:** `Lawyer/Controllers/PaymentController.cs`

```
[ApiController]
[Route("api/payment")]
[Authorize]
public class PaymentController : ControllerBase

```

**Endpoints:**

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/v1/payment/initiate` | Create Paymob intention, return client_secret + publicKey | `[Authorize]` (Lawyer) |
| `GET`  | `/api/v1/payment/callback` | Browser redirect from Paymob — verify HMAC, display result | `[AllowAnonymous]` |
| `POST` | `/api/v1/payment/server-callback` | Server-to-server callback — verify HMAC, update DB **(authoritative)** | `[AllowAnonymous]` |
| `GET`  | `/api/v1/payment/status/{paymentId}` | Check payment status (for frontend polling) | `[Authorize]` (Lawyer) |
| `GET`  | `/api/v1/payment/history` | Get lawyer's payment history | `[Authorize]` (Lawyer) |

#### Important: Two Separate Callbacks

Paymob sends **two** callbacks after payment:

1. **`GET /callback`** (Browser redirect)
   - User's browser is redirected here with transaction data as **query parameters**.
   - HMAC is in `Request.Query["hmac"]`.
   - **Display-only** — shows success/failure HTML/redirect to frontend. Does NOT update DB.

2. **`POST /server-callback`** (Server-to-server)
   - Paymob sends a POST with JSON body containing full transaction details.
   - HMAC is in `Request.Query["hmac"]`, transaction data is in the **request body** under `obj`.
   - **Authoritative** — this is where you update Payment status and activate subscriptions.

#### Callback Controller Logic:

**GET /callback:**
```csharp
[AllowAnonymous]
[HttpGet("callback")]
public IActionResult Callback()
{
    // 1. Read all 20 fields from query parameters
    // 2. Concatenate in exact order (see Step 7)
    // 3. Compute HMAC-SHA512
    // 4. Compare with Request.Query["hmac"]
    // 5. If valid + success=true  → Redirect to frontend success page
    // 6. If valid + success=false → Redirect to frontend failure page
    // 7. If HMAC invalid → Redirect to frontend error page
}
```

**POST /server-callback:**
```csharp
[AllowAnonymous]
[HttpPost("server-callback")]
public async Task<IActionResult> ServerCallback()
{
    // 1. Read hmac from query: Request.Query["hmac"]
    // 2. Read JSON body, parse obj element
    // 3. Extract 20 fields from obj (nested JSON navigation)
    // 4. Compute HMAC-SHA512 and verify
    // 5. Extract merchant_order_id from obj.order.merchant_order_id
    // 6. If valid + success → UpdateOrderSuccess(merchantOrderId)
    // 7. If valid + failed  → UpdateOrderFailed(merchantOrderId)
    // 8. If HMAC invalid → return Unauthorized("Invalid HMAC")
}
```

---

### Step 7: HMAC Verification (Security) — Exact Implementation

**Algorithm:** HMAC-SHA512

**The 20 fields must be concatenated in THIS EXACT ORDER:**

```
 1. amount_cents
 2. created_at
 3. currency
 4. error_occured
 5. has_parent_transaction
 6. id
 7. integration_id
 8. is_3d_secure
 9. is_auth
10. is_capture
11. is_refunded
12. is_standalone_payment
13. is_voided
14. order.id                    ← "order" in GET callback, "order.id" in POST callback
15. owner
16. pending
17. source_data.pan
18. source_data.sub_type
19. source_data.type
20. success
```

#### Critical Difference Between the Two Callbacks:

| | GET `/callback` | POST `/server-callback` |
|---|---|---|
| **Data source** | Query parameters (`Request.Query`) | JSON body (`obj.*`) |
| **Field #14** | `Request.Query["order"]` | Navigate `obj.order.id` in JSON |
| **Boolean format** | String as-is from query | Must serialize as lowercase `"true"` / `"false"` |
| **Missing fields** | Return BadRequest | Treat as empty string `""` |
| **DB update** | NO — display only | YES — authoritative |

#### HMAC Computation:

```csharp
public string ComputeHmacSHA512(string data, string secret)
{
    var keyBytes = Encoding.UTF8.GetBytes(secret);
    var dataBytes = Encoding.UTF8.GetBytes(data);
    using var hmac = new HMACSHA512(keyBytes);
    var hash = hmac.ComputeHash(dataBytes);
    return BitConverter.ToString(hash).Replace("-", "").ToLower();
}
```

#### GET Callback HMAC Verification:

```csharp
var data = string.Concat(
    Request.Query["amount_cents"],
    Request.Query["created_at"],
    Request.Query["currency"],
    Request.Query["error_occured"],
    Request.Query["has_parent_transaction"],
    Request.Query["id"],
    Request.Query["integration_id"],
    Request.Query["is_3d_secure"],
    Request.Query["is_auth"],
    Request.Query["is_capture"],
    Request.Query["is_refunded"],
    Request.Query["is_standalone_payment"],
    Request.Query["is_voided"],
    Request.Query["order"],
    Request.Query["owner"],
    Request.Query["pending"],
    Request.Query["source_data.pan"],
    Request.Query["source_data.sub_type"],
    Request.Query["source_data.type"],
    Request.Query["success"]
);

var receivedHmac = Request.Query["hmac"].ToString();
var calculatedHmac = ComputeHmacSHA512(data, _settings.HMAC);
var isValid = receivedHmac.Equals(calculatedHmac, StringComparison.OrdinalIgnoreCase);
```

#### POST Server-Callback HMAC Verification:

```csharp
// Parse JSON body
using var doc = await JsonDocument.ParseAsync(Request.Body);
var obj = doc.RootElement.GetProperty("obj");

// Helper to safely get string value from JsonElement
string GetField(JsonElement el, string prop)
{
    if (el.TryGetProperty(prop, out var val))
    {
        if (val.ValueKind == JsonValueKind.True) return "true";
        if (val.ValueKind == JsonValueKind.False) return "false";
        return val.ToString() ?? "";
    }
    return "";
}

// Navigate nested properties (e.g., "order.id", "source_data.pan")
string GetNestedField(JsonElement el, string path)
{
    var parts = path.Split('.');
    var current = el;
    foreach (var part in parts)
    {
        if (!current.TryGetProperty(part, out current))
            return "";
    }
    if (current.ValueKind == JsonValueKind.True) return "true";
    if (current.ValueKind == JsonValueKind.False) return "false";
    return current.ToString() ?? "";
}

var data = string.Concat(
    GetField(obj, "amount_cents"),
    GetField(obj, "created_at"),
    GetField(obj, "currency"),
    GetField(obj, "error_occured"),
    GetField(obj, "has_parent_transaction"),
    GetField(obj, "id"),
    GetField(obj, "integration_id"),
    GetField(obj, "is_3d_secure"),
    GetField(obj, "is_auth"),
    GetField(obj, "is_capture"),
    GetField(obj, "is_refunded"),
    GetField(obj, "is_standalone_payment"),
    GetField(obj, "is_voided"),
    GetNestedField(obj, "order.id"),
    GetField(obj, "owner"),
    GetField(obj, "pending"),
    GetNestedField(obj, "source_data.pan"),
    GetNestedField(obj, "source_data.sub_type"),
    GetNestedField(obj, "source_data.type"),
    GetField(obj, "success")
);

var receivedHmac = Request.Query["hmac"].ToString();
var calculatedHmac = ComputeHmacSHA512(data, _settings.HMAC);
var isValid = receivedHmac.Equals(calculatedHmac, StringComparison.OrdinalIgnoreCase);
```

---

### Step 8: Frontend — Pixel Button Integration (React)

**What:** Embed Paymob's Pixel Button in the React frontend.

**8.1 — Add Paymob Script**

In `index.html` or load dynamically:
```html
<script src="https://accept.paymob.com/unifiedcheckout/v1/paymob-checkout.min.js"></script>
```

**8.2 — Payment Flow in React**

```jsx
// 1. Lawyer clicks "Subscribe" on a plan
const handleSubscribe = async (subscriptionId, paymentMethod = "card") => {
  // 2. Call backend to create intention
  const response = await api.post("/api/v1/payment/initiate", {
    lawyerId,
    subscriptionId,
    paymentMethod,
  });

  const { clientSecret, publicKey, paymentId } = response.data;

  // 3. Render Pixel Button
  const checkout = new PaymobCheckout({
    publicKey: publicKey,
    clientSecret: clientSecret,
    onSuccess: (data) => {
      // 4. Navigate to success page, poll for confirmation
      navigate(`/payment/success?paymentId=${paymentId}`);
    },
    onFailure: (data) => {
      navigate(`/payment/failed?paymentId=${paymentId}`);
    },
  });

  checkout.open();
};
```

**8.3 — Payment Status Page**

After Pixel Button completes, frontend can poll `GET /api/v1/payment/status/{paymentId}` to confirm subscription activation (the server-callback may have already processed it).

**8.4 — Alternative: Full-Page Redirect (without Pixel Button)**

If you ever want to skip the Pixel Button and use Paymob's hosted Unified Checkout page instead, build the redirect URL from the backend response:
```
https://accept.paymob.com/unifiedcheckout/?publicKey={publicKey}&clientSecret={clientSecret}
```
Then `window.location = redirectUrl`. The user completes payment on Paymob's page and is redirected back to `GET /api/v1/payment/callback`.

---

### Step 9: Modify Existing Subscription Flow

**What:** The current `SubscribeAsync` and `UpgradeSubscriptionAsync` should no longer activate subscriptions directly from the controller. Payment must be completed first.

**Changes:**

1. **`SubscriptionController`:**
   - Remove direct calls to `SubscribeAsync` from the subscribe/upgrade endpoints.
   - These endpoints become informational (get plans, get current plan).
   - Subscription activation only happens via server-callback after successful payment.

2. **`SubscriptionService.SubscribeAsync`:**
   - Keep the method as-is (it handles deactivating old sub + creating new one).
   - It will now only be called from `PaymobService` after successful payment verification.

3. **`SubscriptionService.UpgradeSubscriptionAsync`:**
   - Modify to validate the upgrade is allowed, then redirect to payment flow.
   - Actual upgrade happens after server-callback confirms success.

---

### Step 10: Register Services & HttpClient

**File:** `Lawyer.Application/DependencyInjection.cs`

```csharp
services.AddScoped<IPaymobService, PaymobService>();
```

**File:** `Lawyer/Program.cs`

```csharp
builder.Services.Configure<PaymobSettings>(builder.Configuration.GetSection("Paymob"));
builder.Services.AddHttpClient("Paymob", client =>
{
    client.BaseAddress = new Uri("https://accept.paymob.com/");
});
```

> **Note:** Use `IHttpClientFactory` (via named client `"Paymob"`) instead of `new HttpClient()` directly. This avoids socket exhaustion and follows .NET best practices.

---

### Step 11: Database Migration

Run after adding the `Payment` entity and `DbSet`:

```bash
dotnet ef migrations add AddPaymentTable -p Lawyer.Infrastructure -s Lawyer
dotnet ef database update -p Lawyer.Infrastructure -s Lawyer
```

---

### Step 12: Configure Paymob Webhook URLs

In Paymob Dashboard > Developers > Webhooks, set:

| Callback Type | URL |
|---------------|-----|
| Transaction processed callback | `https://your-api-domain.com/api/v1/payment/server-callback` |
| Transaction response callback | `https://your-api-domain.com/api/v1/payment/callback` |

> For local development, use **ngrok** or similar to expose your local server:
> ```bash
> ngrok http 5000
> ```
> Then set the ngrok URL in the Paymob dashboard.

---

### Step 13: Testing Checklist

- [ ] Create payment intention and receive `client_secret` from Paymob
- [ ] Pixel Button renders correctly with `publicKey` + `clientSecret`
- [ ] Pixel Button accepts test card and completes payment
- [ ] `GET /callback` receives browser redirect with HMAC — verify and redirect to frontend
- [ ] `POST /server-callback` receives server callback — HMAC verified correctly
- [ ] HMAC verification rejects tampered data (change a field, confirm HMAC fails)
- [ ] Subscription activates only after successful server-callback (NOT on browser callback)
- [ ] Failed payment does NOT activate subscription
- [ ] Duplicate callbacks are idempotent (same `merchant_order_id` not processed twice)
- [ ] Payment history returns correct records for the lawyer
- [ ] Upgrade flow goes through payment before switching plan
- [ ] Mobile wallet payment method works (if `MobileIntegrationId` is configured)
- [ ] Admin revenue report includes payment data

---

### Step 14: Paymob Test Credentials

Use Paymob sandbox/test mode for development:

| Field | Value |
|-------|-------|
| Test Card (Mastercard) | `5123456789012346` |
| Expiry | Any future date |
| CVV | `123` |
| 3DS OTP | `123456` |

---

## File Summary — New & Modified Files

### New Files
| File | Layer | Purpose |
|------|-------|---------|
| `Lawyer.Core/Models/Payment.cs` | Core | Payment entity |
| `Lawyer.Core/Enums/PaymentStatus.cs` | Core | Payment status enum |
| `Lawyer.Core/Settings/PaymobSettings.cs` | Core | Paymob config class (6 keys) |
| `Lawyer.Application/IServices/IPaymobService.cs` | Application | Service interface |
| `Lawyer.Application/Services/PaymobService.cs` | Application | Intention API + callback handling + HMAC |
| `Lawyer.Application/Dtos/PaymentDto.cs` | Application | Payment DTOs |
| `Lawyer/Controllers/PaymentController.cs` | API | 5 endpoints (initiate, callback, server-callback, status, history) |

### Modified Files
| File | Change |
|------|--------|
| `Lawyer/appsettings.json` | Add `Paymob` section (6 keys) |
| `Lawyer/Program.cs` | Register `PaymobSettings`, named `HttpClient` |
| `Lawyer.Application/DependencyInjection.cs` | Register `IPaymobService` |
| `Lawyer.Infrastructure/Persistence/AppDbContext.cs` | Add `DbSet<Payment>` |
| `Lawyer/Controllers/SubscriptionController.cs` | Remove direct subscription activation |
| `Lawyer.Application/Services/SubscriptionService.cs` | Called from server-callback only |

---

## Architecture Diagram

```
React Frontend                    .NET Backend                        Paymob
─────────────                    ────────────                        ──────

1. Select Plan ──────────> POST /api/v1/payment/initiate
   + paymentMethod            │
                              ├── Validate lawyer & plan
                              ├── Build intention payload
                              ├── POST /v1/intention/ ─────────────────>
                              │   Authorization: Token <SecretKey>
                              │                           <──── { client_secret }
                              ├── Save Payment (Pending, TransactionId=specialRef)
                       <───── Return { clientSecret, publicKey, paymentId }

2. Open Pixel Button
   new PaymobCheckout({
     publicKey, clientSecret
   }).open()
   Lawyer enters card ──────────────────────────────────────> Payment UI
   Lawyer completes   ──────────────────────────────────────>

3.                                                        Two callbacks fire:

   Browser redirect:       GET /api/v1/payment/callback  <────── (query params + hmac)
                              ├── Verify HMAC (20 fields from query)
                              ├── Display only — NO DB update
                              └── Redirect to frontend success/failure page

   Server-to-server:       POST /api/v1/payment/server-callback <── (JSON body + hmac in query)
                              ├── Verify HMAC (20 fields from obj in JSON body)
                              ├── Extract merchant_order_id
                              ├── Find Payment by TransactionId
                              ├── If success: Payment.Status = Success
                              │               → SubscribeAsync(lawyerId, subId)
                              ├── If failed:  Payment.Status = Failed
                              └── Return 200 OK ─────────────────────>

4. Pixel Button onSuccess fires
   navigate(/payment/success)
   Poll GET /api/v1/payment/status/{paymentId}
                       <───── { status: "Success", planActivated: true }
   Show confirmation
```

---

## Implementation Order (Recommended)

| Order | Steps | What |
|-------|-------|------|
| 1 | Step 1 | Config & credentials in appsettings |
| 2 | Step 2 + 3 | Payment entity, enum, settings class |
| 3 | Step 11 | Database migration |
| 4 | Step 4 + 5 | PaymobService + DTOs |
| 5 | Step 6 + 7 | PaymentController + HMAC verification (both callbacks) |
| 6 | Step 10 | DI registration |
| 7 | Step 12 | Configure webhook URLs in Paymob dashboard |
| 8 | Step 9 | Modify existing subscription flow |
| 9 | Step 8 | Frontend Pixel Button integration |
| 10 | Step 13 + 14 | Testing with sandbox credentials |
