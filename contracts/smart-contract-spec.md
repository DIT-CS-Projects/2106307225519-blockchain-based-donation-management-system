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

DonationRegistry.sol

---

# Responsibilities

The contract shall:

* Register donation proofs.
* Store donation hashes.
* Store campaign identifiers.
* Store timestamps.
* Generate blockchain transaction records.
* Allow public verification.

---

# Data Stored On-Chain

* Donation ID
* Campaign ID
* Payment Reference
* SHA-256 Donation Hash
* Timestamp
* Blockchain Transaction Hash

No personal information is stored on-chain.

---

# Data Stored Off-Chain

SQLite stores:

* Donor profile
* Campaign details
* Beneficiary details
* Payment information
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
