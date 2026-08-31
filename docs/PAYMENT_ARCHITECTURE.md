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

Three adapters exist today:

- mock: a self-contained local checkout, the default. No credentials or public callback URL needed.
- clickpesa: a real gateway for mobile money. Moves real money immediately, capped until KYC is approved.
- azampay: a real gateway for mobile money. Requires approved KYC before any live credential is issued.

Selected with PAYMENT_PROVIDER. A real adapter requires all of its credentials;
if a selected provider is incomplete, checkout returns a visible configuration
error rather than silently sending donors through a mock payment flow.

ClickPesa is the gateway that can demonstrate an actual payment without waiting on onboarding, because it lets an unverified account transact within a ceiling. AzamPay remains implemented and switchable.

---

# ClickPesa Adapter

## Mobile money

- createSession generates a token (cached for its full hour), then calls initiate-ussd-push-request with the amount, currency, order reference and payer number.
- ClickPesa pushes a USSD/PIN prompt to the payer's handset. There is no hosted checkout page and no redirect.
- The donor is sent to the same in-app waiting screen used for AzamPay. The
  ClickPesa webhook is the primary confirmation route; an authenticated status
  lookup is a recovery route so a delayed or missed webhook cannot strand a
  completed payment.
- A response status of PROCESSING is the normal path: the prompt is on its way and the donor has not entered a PIN yet.

## Operator routing

- ClickPesa routes on the phone number alone, so the donor's chosen operator is not sent. The operator actually used comes back as `channel` and is kept in the stored provider response.
- Phone numbers are normalized to 255XXXXXXXXX, without a leading plus.

## Order reference

- ClickPesa requires an alphanumeric order reference, so the hyphens in `CHG-2026-ABCD1234` are stripped on the way out and restored on the way back. The layout is fixed (prefix, four-digit year, code), which makes the round trip exact rather than a lookup.

## Webhook authenticity

- ClickPesa sends no signature header. The unguessable secret on the registered webhook URL (?key=...) is the primary proof that a callback is ours.
- A webhook is accepted only when that secret matches, the order reference maps back to the stored transaction, and, for a success, the collected amount matches. A failure notice carries no amount, so the amount check applies to successes only.
- When a checksum key is configured and the payload carries a checksum, it is verified as HMAC-SHA256 over the canonicalized payload.
- Payloads arrive wrapped as `{ event, data }`; a flat payload is tolerated.

## Pre-KYC limits

- An unverified account transacts for real, capped at TZS 100,000 total across collections, payouts, deposits and withdrawals, and 100 API calls per day including token generation.
- The adapter therefore caches the token for its full life and does not call the optional preview endpoint, so one payment costs one API call.
- Completing KYC in Settings > KYC lifts both limits. No code or configuration changes when it is approved.

## Live completion guarantee

- A successful ClickPesa payment creates the donation, receipt and pending
  blockchain record atomically. The proof writer is started immediately after
  that transaction.
- Webhooks are primary; the authenticated ClickPesa payment-status endpoint is
  queried from the donor waiting screen as a recovery path.
- The application refuses to start a live ClickPesa checkout unless the
  blockchain RPC URL, signing wallet and deployed contract address are all
  configured. This prevents collecting real money when an on-chain proof could
  not even be submitted.

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
