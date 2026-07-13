# BLOCKCHAIN IMPLEMENTATION GUIDE

## Philosophy

Blockchain exists only to provide transparency.

Business logic belongs in the backend.

---

## Network

Hardhat Local Network

Development

Ethereum Sepolia

Testing & Demonstration

Ethereum Mainnet or Layer 2

Future Production

Future support for Polygon.

---

## Wallet

Backend Wallet

Private Key

Environment Variable

Never expose private keys.

---

## Smart Contract

One responsibility

Record donation and disbursement proofs.

Nothing else.

---

## Smart Contract Stores

Donation ID

Campaign ID

SHA-256 Proof Hash

Timestamp

Disbursement proofs follow the same structure.

Never store

Email

Phone

Names

Personal information

---

## Frontend

Never connects directly to blockchain.

Everything goes through backend.

---

## Gas Optimization

One transaction per completed donation. Never batch.

Store hashes only.

Avoid unnecessary writes.

---

## Verification

Frontend requests backend.

Backend checks blockchain.

Return verification result.

---

## Errors

Blockchain failure must never lose donation data.

Donation remains valid.

Verification can be retried later.