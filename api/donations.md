# DONATION API

Base URL

/api/donations

---

# Create Donation

POST /

Authentication Required

Request

Campaign ID

Amount

Payment Method

Response

Donation Session

Payment URL

Reference

---

# Payment Callback

POST /callback

Payment Provider Only

Responsibilities

Validate Payment

Store Donation

Generate Receipt

Create Blockchain Record

Send Notification

---

# Donation History

GET /history

Authentication Required

Returns

All donations made by current donor.

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