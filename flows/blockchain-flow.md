# BLOCKCHAIN FLOW

## Purpose

Defines blockchain interaction.

---

Payment Confirmed

↓

Backend Generates Verification Payload

↓

Hash Created

↓

Smart Contract Called

↓

Ethereum Network

↓

Transaction Mined

↓

Transaction Hash Returned

↓

PostgreSQL Updated

↓

Verification Badge Updated

↓

User Can Verify Donation

---

## Verification

User Opens Donation

↓

Click Verify

↓

Backend Queries Blockchain

↓

Match Found?

YES

↓

Verified

↓

Display Transaction

---

NO

↓

Display Verification Failed

↓

Suggest Retry

---

## Rules

Blockchain stores only proof.

PostgreSQL stores operational data.

Completed disbursements follow the same recording flow with a disbursement proof.

Blockchain is never queried directly by frontend.

Smart contract never receives personal information.