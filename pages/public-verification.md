# PUBLIC VERIFICATION PAGE

## Purpose

Allow anyone to verify a donation or disbursement on the blockchain without logging in.

This is the public face of the platform's transparency promise.

---

# Route

/verify

Optional deep link

/verify/:receiptNumber

Public. No authentication required.

---

# Layout

Public Layout

↓

Heading

↓

Receipt Lookup Field

↓

Verify Button

↓

Result Panel

---

# Lookup

Field

Receipt Number

Behaviour

- User enters a receipt number
- Backend looks up the matching donation or disbursement
- Backend confirms the on-chain proof

---

# Result Panel

On success

- Verified Badge
- Type (Donation or Disbursement)
- Campaign Title
- Amount
- Date
- Transaction Hash
- Blockchain Explorer Link

Never displays donor names, contact details or any personal data.

On failure

- Friendly "No verified record found for this receipt" message

---

# API

GET /api/verify/:receiptNumber

Public

Returns proof status and non-personal details only.

---

# States

Loading

Spinner on the verify button

Empty

Prompt to enter a receipt number

Error

Friendly retry message

---

# Mobile

Single-column layout.

Large touch targets.

---

# Animation

Fade

Result panel slide in
