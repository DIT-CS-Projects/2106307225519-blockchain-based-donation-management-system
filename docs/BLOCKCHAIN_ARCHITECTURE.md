# BLOCKCHAIN ARCHITECTURE

## Overview

Blockchain is used exclusively as a transparency and verification layer.

It is NOT used as the primary database.

Sensitive application information remains inside SQLite.

Blockchain provides immutable proof that a donation occurred.

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
- Transaction Hash
- Wallet Address
- Timestamp
- Verification Hash

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
- Verify donation existence
- Return donation proof
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

SQLite stores transaction hash

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

# Future Expansion

The blockchain layer should support:

- Multiple smart contracts
- Multi-chain deployment
- Public verification page
- NFT donor certificates (optional future feature)