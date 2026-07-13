# DONATION API

Base URL

/api/donations

---

# Creating Donations

Donations are never created directly through this API.

A donation record is created by the backend only after a payment has been verified.

To start a donation, the frontend calls:

POST /api/payments/create-session

The payment provider callback is handled at:

POST /api/payments/callback

See api/payment.md.

---

# Donation History

GET /history

Authentication Required

Returns

All donations made by current donor.

---

# Donor Summary

GET /summary

Authentication Required

Returns

Total Amount Donated

Campaigns Supported

Verified Donations

Monthly Donation Chart Data

---

# Donation Details

GET /:id

Authentication Required

Returns

Donation

Receipt

Blockchain Hash

Payment Status

---

# Download Receipt

GET /:id/receipt

Authentication Required

Returns

PDF Receipt

---

# Verify Donation

GET /:id/verify

Authentication Required

Returns

Blockchain Status

Transaction Hash

Verification Result

---

# Donation Statistics

GET /statistics

Admin Only

Returns

Total Donations

Today's Donations

Monthly Donations

Campaign Totals