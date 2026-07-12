# BLOCKCHAIN API

## Base URL

/api/blockchain

---

# Overview

The blockchain service records immutable proof of completed donations.

The frontend never communicates directly with smart contracts.

All blockchain communication occurs through the backend.

---

# Record Donation

POST /record

Backend Only

Purpose

Store donation proof after successful payment.

Request

Donation ID

Campaign ID

Receipt Number

Amount

Timestamp

---

# Verify Donation

GET /verify/:donationId

Authentication Required

Returns

{
    "verified": true,
    "transactionHash": "...",
    "blockNumber": 1234567,
    "network": "Sepolia"
}

---

# Get Transaction

GET /transaction/:hash

Authentication Required

Returns

Blockchain information.

---

# Blockchain Health

GET /status

Admin Only

Returns

Network Status

RPC Status

Contract Status

Latest Block

---

# Smart Contract Events

GET /events

Admin Only

Returns

DonationRecorded

Verification Events

Contract Events

---

# Errors

400 Invalid Hash

404 Transaction Not Found

500 Blockchain Error