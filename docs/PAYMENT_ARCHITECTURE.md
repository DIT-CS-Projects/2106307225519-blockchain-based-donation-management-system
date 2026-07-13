# PAYMENT ARCHITECTURE

## Overview

The application supports donations through Tanzanian payment methods and traditional banking channels.

Users should never need cryptocurrency to donate.

Blockchain operates silently after payment confirmation.

---

# Payment Gateway

AzamPay is the selected payment gateway (Decision 009).

The backend integrates AzamPay through the Payment Service abstraction described below.

Sandbox credentials are used during development. Production credentials require NGO merchant onboarding with AzamPay.

---

# Supported Payment Methods

The platform supports through AzamPay:

Mobile Money

- M-Pesa
- Airtel Money
- Mixx (formerly Tigo Pesa)
- HaloPesa

Banking

- CRDB
- NMB
- NBC
- Standard Chartered

Card payments (Visa, Mastercard) are a future enhancement.

Additional providers can be added later.

---

# Payment Philosophy

Users should experience a familiar checkout process.

The payment interface should resemble modern fintech applications rather than cryptocurrency wallets.

Payments should complete within a few simple steps.

---

# Payment Flow

Select Campaign

↓

Enter Donation Amount

↓

Choose Payment Method

↓

Complete Payment

↓

Payment Provider Confirms

↓

Backend Validates

↓

Donation Saved

↓

Blockchain Proof Created

↓

Receipt Generated

↓

Success Screen Displayed

---

# Payment Service Layer

The backend communicates with payment providers through a Payment Service abstraction.

Example:

PaymentService

↓

Provider Adapter

↓

Payment Provider API

This design allows providers to be changed without affecting business logic.

---

# Failed Payments

If payment fails:

- Donation is not recorded
- Blockchain transaction is not created
- User receives an error message
- User may retry payment

---

# Successful Payments

A successful payment results in:

- Donation record
- Receipt generation
- Blockchain proof
- Notification
- Dashboard update

---

# Security

Payment information should:

- Travel over HTTPS
- Never expose secret keys
- Never store raw payment credentials
- Validate every callback
- Record all payment attempts

---

# Future Enhancements

Future versions may include:

- Recurring donations
- Scheduled donations
- QR code payments
- International payment gateways
- Multi-currency support
- Donation subscriptions