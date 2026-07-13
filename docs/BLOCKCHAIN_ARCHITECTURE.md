# BLOCKCHAIN ARCHITECTURE

## Overview

Blockchain is used exclusively as a transparency and verification layer.

It is NOT used as the primary database.

Sensitive application information remains inside PostgreSQL.

Blockchain provides immutable proof that a donation or disbursement occurred.

---

# Technology

Ethereum

↓

Solidity

↓

Hardhat

↓

Ethers.js

---

# Purpose

Blockchain provides:

- Transparency
- Tamper resistance
- Immutable donation records
- Public verification

---

# Data Stored On-Chain

Only the minimum required information is stored.

Each completed donation records:

- Donation ID
- Campaign ID
- SHA-256 Proof Hash
- Timestamp

The proof hash is computed by the backend over the donation ID, campaign ID, amount, receipt number, payment reference and timestamp.

Raw amounts, payment references and wallet addresses are never stored on-chain.

Disbursement proofs follow the same structure with a disbursement ID.

---

# Data Never Stored On-Chain

The following information must NEVER be written to blockchain:

- Full Name
- Email
- Phone Number
- Password
- Beneficiary Details
- Campaign Description
- Payment Details
- Personal Information

---

# Smart Contract Responsibilities

The smart contract:

- Record donation proof
- Record disbursement proof
- Verify donation existence
- Verify disbursement existence
- Return stored proofs
- Reject duplicate proof entries

The smart contract does NOT:

- Authenticate users
- Process payments
- Store profiles
- Store campaigns
- Manage notifications

---

# Donation Verification Flow

Payment Successful

↓

Backend validates payment

↓

Backend generates proof

↓

Smart Contract stores proof

↓

Transaction Hash returned

↓

PostgreSQL stores transaction hash

↓

Frontend displays verification

---

# Blockchain Security

Smart contracts should:

- Prevent duplicate records
- Validate inputs
- Emit events
- Minimize gas usage
- Keep logic simple

---

# Public Verification

A public verification page allows anyone to verify a donation or disbursement by receipt number, without an account.

Verification returns proof status only — never personal data.

---

# Future Expansion

The blockchain layer should support:

- Multiple smart contracts
- Multi-chain deployment
- NFT donor certificates (optional future feature)