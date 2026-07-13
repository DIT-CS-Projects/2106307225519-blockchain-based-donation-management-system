# Smart Contract Specification

## Overview

The Blockchain-Based NGO Donation Management System uses Ethereum smart contracts to create immutable proof of donations. The smart contract does **not** receive cryptocurrency payments directly. Instead, it records verified donation information after successful payment through Tanzanian payment gateways.

---

# Objectives

* Provide immutable donation records.
* Enable public verification.
* Prevent record tampering.
* Minimize blockchain transaction costs.

---

# Blockchain Network

Development

* Hardhat Local Network

Testing

* Sepolia Testnet

Production

* Ethereum Mainnet or a compatible Layer-2 network.

---

# Contract Name

TransparencyRegistry.sol

The contract records donation proofs and disbursement proofs.

---

# Responsibilities

The contract shall:

* Register donation proofs.
* Register disbursement proofs.
* Store proof hashes.
* Store campaign identifiers.
* Store timestamps.
* Generate blockchain transaction records.
* Allow public verification.

---

# Data Stored On-Chain

* Donation ID
* Campaign ID
* SHA-256 Donation Proof Hash
* Timestamp

The proof hash is computed by the backend over the donation ID, campaign ID, amount, receipt number, payment reference and timestamp.

No personal information, raw amount or raw payment reference is stored on-chain.

Each completed donation produces exactly one blockchain transaction.

Disbursement proofs follow the same structure with a disbursement ID, and each completed disbursement also produces exactly one blockchain transaction.

---

# Data Stored Off-Chain

PostgreSQL stores:

* Donor profile
* Campaign details
* Beneficiary details
* Beneficiary payout details
* Payment information
* Disbursement records
* Reports
* Notifications
* Analytics

---

# Main Functions

registerDonation()

Creates a blockchain proof after payment confirmation.

---

verifyDonation()

Returns blockchain verification status.

---

getDonation()

Returns immutable donation information.

---

registerDisbursement()

Creates a blockchain proof after a completed disbursement.

---

verifyDisbursement()

Returns disbursement verification status.

---

# Security

* Only backend wallet may call write functions.
* Public verification is read-only.
* No donor private keys.
* No cryptocurrency wallet required for donors.

---

# Gas Optimization

* Store hashes only.
* Avoid unnecessary events.
* Minimize storage variables.

---

# Future Enhancements

* Multi-signature approvals.
* DAO governance.
* Automatic fund release.
* Cross-chain support.
