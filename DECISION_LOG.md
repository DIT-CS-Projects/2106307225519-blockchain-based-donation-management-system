# Decision Log

This document records all major architectural and engineering decisions made throughout the project.

---

## Decision 001

### Use SQLite instead of PostgreSQL

Reason

* Easier deployment
* No database server installation
* Suitable for Final Year Project
* Simpler backup and maintenance

Status

Approved

---

## Decision 002

### Backend manages blockchain interactions

Reason

* Users should never handle private keys
* Better security
* Easier integration with local payments
* Simpler user experience

Status

Approved

---

## Decision 003

### Traditional React Architecture

Frontend

↓

Express Backend

↓

SQLite

↓

Ethereum Blockchain

Reason

* Easier maintenance
* Clear separation of responsibilities
* Better scalability

Status

Approved

---

## Decision 004

### Revolut-inspired UI

Reason

* Clean fintech appearance
* Premium user experience
* Modern interface
* Professional presentation

Status

Approved

---

## Decision 005

### Blockchain stores proofs only

Stored on-chain

* Transaction hash
* Donation proof
* Timestamp
* Verification data

Stored in SQLite

* User accounts
* Campaigns
* Beneficiaries
* Reports
* Notifications
* Payment details

Reason

Reduce blockchain costs while maintaining transparency.

---

## Decision 006

### Mobile Money First

Primary payment methods

* M-Pesa
* Airtel Money
* Tigo Pesa
* HaloPesa
* Bank payments

Reason

Designed specifically for Tanzanian users.

---

## Decision 007

### GitHub-first Development

Reason

* Version control
* Collaboration
* Backup
* CI/CD readiness

---

## Decision 008

### Stable Technology Versions

Reason

Avoid unstable releases while maintaining modern development practices.

---

Future architectural decisions should be added to this document instead of modifying previous decisions.
