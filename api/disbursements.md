# DISBURSEMENTS API

Base URL

/api/disbursements

Administrator only.

---

# Overview

Disbursements are fiat payouts from a campaign's raised funds to a verified beneficiary.

The backend sends payouts through the AzamPay disbursement API.

Every completed disbursement produces an immutable blockchain proof, exactly like a donation.

Large disbursements require approval from a second administrator (dual approval).

---

# List Disbursements

GET /

Administrator only.

Supports

Status Filter

Campaign Filter

Pagination

---

# Disbursement Details

GET /:id

Administrator only.

Returns

Disbursement

Approval History

Payment Reference

Blockchain Hash

Status

---

# Initiate Disbursement

POST /

Administrator only.

Request

Campaign ID

Beneficiary ID

Amount

Purpose

Behaviour

- Beneficiary must be verified and belong to the campaign
- Amount must not exceed the campaign's available balance
- If amount is below the dual-approval threshold, status becomes Approved and payout is queued
- If amount is at or above the threshold, status becomes Pending Approval
- The initiating administrator can never approve their own disbursement

Response

201 Created

---

# Approve Disbursement

POST /:id/approve

Administrator only.

Behaviour

- Only disbursements in Pending Approval can be approved
- The approver must be different from the initiator
- On approval, payout is queued to AzamPay

---

# Reject Disbursement

POST /:id/reject

Administrator only.

Request

Reason

Behaviour

- Only disbursements in Pending Approval can be rejected
- Status becomes Rejected
- No payout occurs

---

# Payout Callback

POST /callback

AzamPay Only

Responsibilities

- Validate callback
- Confirm payout
- Update disbursement status
- Record blockchain proof
- Send notification

---

# Disbursement Status

Draft states progress as follows

- Pending Approval
- Approved
- Processing
- Completed
- Failed
- Rejected

---

# Available Balance

GET /balance/:campaignId

Administrator only.

Returns

Total Raised

Total Disbursed

Available Balance

---

# Errors

400 Invalid Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Insufficient Balance

409 Self Approval Not Allowed

500 Disbursement Error
