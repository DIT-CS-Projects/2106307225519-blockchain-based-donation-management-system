# PAYMENT FLOW

## Overview

Payments are processed outside the application.

The application never stores payment credentials.

---

Donor

↓

Select Amount

↓

Choose Payment Method

↓

Backend Creates Payment Session

↓

Payment Provider

↓

User Completes Payment

↓

Payment Provider Callback

↓

Backend Verification

↓

Payment Valid?

YES

↓

Store Donation

↓

Generate Receipt

↓

Record Blockchain Proof

↓

Notify User

↓

Dashboard Update

↓

Success Page

---

NO

↓

Reject Donation

↓

Log Failure

↓

Show Retry Option

---

## Important Rules

No blockchain transaction occurs before payment confirmation.

Every payment must have one unique payment reference.

Every donation must have one receipt.

Duplicate callbacks must be ignored safely.