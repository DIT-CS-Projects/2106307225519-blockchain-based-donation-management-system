# DISBURSEMENT FLOW

## Purpose

Defines how funds move from a campaign to a verified beneficiary.

Funds are fiat (TZS) and are paid out through AzamPay.

Blockchain records an immutable proof of every completed disbursement.

---

Admin Opens Campaign

↓

View Available Balance

↓

Select Verified Beneficiary

↓

Enter Amount And Purpose

↓

Validate Balance And Beneficiary

↓

Amount Below Threshold?

YES

↓

Auto Approved

↓

Queue Payout

NO

↓

Pending Approval

↓

Second Admin Reviews

↓

Approve Or Reject

---

## Payout

Payout Queued

↓

AzamPay Disbursement API

↓

Payout Callback

↓

Backend Verifies

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

A disbursement requires a verified beneficiary belonging to the campaign.

A disbursement can never exceed the campaign's available balance.

The initiating administrator can never approve their own disbursement.

Disbursements at or above the threshold require a second administrator's approval.

Every completed disbursement produces exactly one blockchain transaction.

Disbursement records are immutable and never deleted.
