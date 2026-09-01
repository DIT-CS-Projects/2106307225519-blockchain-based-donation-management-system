# DISBURSEMENTS API

Base URL

/api/disbursements

Campaign owner (fundraiser) or administrator. A fundraiser is scoped to their own campaigns; an administrator sees all (Decision 020).

---

# Overview

Disbursements are fiat payouts from a campaign's raised funds to a verified beneficiary.

A payout is initiated by the campaign owner: a fundraiser on their own campaigns, or an administrator on any campaign.

The backend sends payouts through the ClickPesa Mobile Money Payout API from
the NGO merchant account's available payout balance.

Every completed disbursement produces an immutable blockchain proof, exactly like a donation.

The dual-approval threshold (1,000,000 TZS) applies to the cumulative amount already self-released on a campaign, not to a single payout. A payout that would take the campaign's cumulative self-released total to or above the threshold requires administrator approval; below that, it releases without a second approval (Decision 020).

---

# List Disbursements

GET /

Campaign owner or administrator. A fundraiser sees only disbursements on campaigns they own.

Supports

Status Filter

Campaign Filter

Pagination

---

# Disbursement Details

GET /:id

Campaign owner or administrator.

Returns

Disbursement

Approval History

Payment Reference

Blockchain Hash

Status

---

# Initiate Disbursement

POST /

Campaign owner (fundraiser) or administrator. A fundraiser may initiate only on campaigns they own.

Request

Campaign ID

Beneficiary ID

Amount

Purpose

Behaviour

- Beneficiary must be verified and belong to the campaign
- Amount must not exceed the campaign's available balance
- If this payout keeps the campaign's cumulative self-released total below the dual-approval threshold, status becomes Approved and payout is queued
- If this payout would take the cumulative self-released total to or above the threshold, status becomes Pending Approval and an administrator must approve it
- The initiator can never approve their own disbursement

Response

201 Created

---

# Approve Disbursement

POST /:id/approve

Administrator only.

Behaviour

- Only disbursements in Pending Approval can be approved
- The approver must be an administrator other than the initiator
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

Campaign owner or administrator.

Returns

Total Raised

Total Disbursed

Available Balance

Cumulative Self-Released (toward the dual-approval threshold)

Self-Serve Remaining

---

# Errors

400 Invalid Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Insufficient Balance

409 Self Approval Not Allowed

500 Disbursement Error
