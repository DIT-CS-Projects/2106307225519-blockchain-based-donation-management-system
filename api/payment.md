# PAYMENT API

## Base URL

/api/payments

---

# Overview

The payment service is responsible for initiating, validating and confirming donations.

The backend communicates directly with the payment provider.

The frontend never communicates with payment providers.

---

# Create Payment Session

POST /create-session

Authentication

Required

Request

{
    "campaignId": 1,
    "amount": 50000,
    "currency": "TZS",
    "paymentMethod": "mobile_money",
    "provider": "..."
}

Response

201 Created

{
    "paymentReference": "...",
    "checkoutUrl": "...",
    "expiresAt": "..."
}

---

# Verify Payment

POST /verify

Authentication

Backend Only

Purpose

Verify payment after callback.

Response

{
    "verified": true,
    "status": "SUCCESS"
}

---

# Payment Callback

POST /callback

Authentication

Provider Only

Responsibilities

• Validate callback

• Confirm payment

• Save donation

• Create receipt

• Record blockchain proof

• Send notification

---

# Payment Status

GET /status/:reference

Authentication Required

Returns

Payment status

Donation status

Receipt availability

---

# Refund Payment

POST /refund

Future Implementation

Admin Only

---

# Errors

400 Invalid Request

401 Unauthorized

404 Payment Not Found

409 Duplicate Payment

500 Payment Error