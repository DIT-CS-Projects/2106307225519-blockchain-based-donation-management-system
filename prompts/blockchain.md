# BLOCKCHAIN IMPLEMENTATION GUIDE

## Philosophy

Blockchain exists only to provide transparency.

Business logic belongs in the backend.

---

## Network

Ethereum Sepolia

Development

Ethereum Mainnet

Production

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

Record donation proof.

Nothing else.

---

## Smart Contract Stores

Donation Hash

Timestamp

Campaign ID

Amount Hash

Receipt Hash

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

Batch operations when possible.

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