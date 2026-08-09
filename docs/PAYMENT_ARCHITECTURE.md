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

Two adapters exist today:

- mock: a self-contained local checkout, the default. No credentials or public callback URL needed.
- azampay: the real gateway for mobile money.

Selected with PAYMENT_PROVIDER. The azampay adapter activates only when every credential is present (app name, client id, client secret, API key, callback secret); otherwise the service falls back to the mock and logs a warning, so a half-configured environment still boots.

---

# AzamPay Adapter

## Mobile money

- createSession requests an AzamPay auth token, then calls the MNO checkout endpoint with the payer's mobile number, the amount, our payment reference (as externalId) and the operator.
- AzamPay pushes a USSD/PIN prompt to the payer's handset. There is no hosted checkout page and no redirect.
- The donor is sent to an in-app waiting screen that polls payment status until the callback resolves the transaction, then to the receipt.

## Bank

- The bank rail is not wired to AzamPay yet. While PAYMENT_PROVIDER=azampay, bank checkouts keep running on the mock provider inside the adapter, so the rail stays functional.

## Provider naming

- Our keys map to AzamPay operators: mpesa to Mpesa, airtel to Airtel, mixx (Mixx by Yas, formerly Tigo Pesa) to Tigo, halopesa to Halopesa.

## Callback authenticity

- AzamPay posts asynchronously to the registered callback URL, which carries an unguessable secret as a query parameter (?key=...).
- A callback is accepted only when the secret matches, the echoed reference (utilityref) matches the stored transaction, and the amount matches. The secret travels in the URL, never in the stored payload.
- Duplicate callbacks are idempotent: a transaction is finalized once.

## Local development

- AzamPay cannot reach localhost. To test the live gateway, expose the backend with a public tunnel (for example ngrok or cloudflared to PORT 4000) and register that URL plus the secret as the callback in the AzamPay portal.
- The mock provider remains the default and needs no tunnel or credentials.

## Sandbox versus production

Sandbox exercises the entire flow (checkout call, PIN prompt, callback, donation, receipt, blockchain proof) but moves no money. Only production credentials move real funds.

| | Auth host | Checkout host |
|---|---|---|
| Sandbox | authenticator-sandbox.azampay.co.tz | sandbox.azampay.co.tz |
| Production | authenticator.azampay.co.tz | checkout.azampay.co.tz |

Going live:

1. Submit the organisation's business KYC from the AzamPay sandbox portal. Live credentials are issued only after AzamPay approves it, which is a business process and not a code change.
2. Set AZAMPAY_AUTH_BASE_URL and AZAMPAY_CHECKOUT_BASE_URL to the production hosts, together, and replace all four credentials with the live ones. Mixing a sandbox host with a production credential fails confusingly; the service logs a warning if the two hosts disagree.
3. Register the production callback URL, with its secret, in the production portal. Sandbox registrations do not carry over.
4. Confirm from the startup log line, which states either "sandbox, no real money" or "PRODUCTION, real money".

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