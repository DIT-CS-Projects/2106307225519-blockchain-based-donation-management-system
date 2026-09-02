# DISBURSEMENT FLOW

## Purpose

Defines how funds move from a campaign to a verified beneficiary.

Funds are fiat (TZS) and are paid out through ClickPesa's Mobile Money Payout API.

Blockchain records an immutable proof of every completed disbursement.

---

Campaign Owner Opens Campaign

(fundraiser on own campaign, or administrator on any)

↓

View Available Balance And Self-Serve Remaining

↓

Select Verified Beneficiary

↓

Enter Amount And Purpose

↓

Validate Balance And Beneficiary

↓

Cumulative Self-Released Stays Below Threshold?

YES

↓

Auto Approved

↓

Queue Payout

NO

↓

Pending Approval

↓

Administrator Reviews (never the initiator)

↓

Approve Or Reject

---

## Payout

Payout Queued

↓

ClickPesa Mobile Money Payout API

↓

ClickPesa Accepts Immediately Or Processes Asynchronously

↓

Backend Polls Payout Status (short-lived automatic poll after
approval, then reconciled again whenever an admin opens the list or
detail view, since ClickPesa sends no payout webhook)

↓

Disbursement Marked Completed

↓

Blockchain Proof Recorded

↓

PostgreSQL Updated

↓

Notification Sent

↓

Available Balance Reduced

---

## Failure

Payout Fails

↓

Disbursement Marked Failed

↓

Funds Remain Available

↓

Admin May Retry

---

## Rules

A payout is initiated by the campaign owner: a fundraiser on their own campaign, or an administrator on any campaign.

A disbursement requires a verified beneficiary belonging to the campaign.

A disbursement can never exceed the campaign's available balance.

The dual-approval threshold applies to the cumulative amount already self-released on the campaign, not to a single payout (Decision 020).

A payout that would take the campaign's cumulative self-released total to or above the threshold requires an administrator's approval.

The initiator can never approve their own disbursement; the approver is always an administrator other than the initiator.

Every completed disbursement produces exactly one blockchain transaction.

Disbursement records are immutable and never deleted.
