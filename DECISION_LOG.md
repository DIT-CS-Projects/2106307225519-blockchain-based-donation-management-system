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

Superseded by Decision 015

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

## Decision 009

### AzamPay as Payment Gateway

Reason

* Tanzanian aggregator covering M-Pesa, Airtel Money, Mixx (formerly Tigo Pesa), HaloPesa and banks
* Free developer sandbox for real API integration during development
* Single REST API with asynchronous callbacks
* Production requires NGO merchant onboarding only

Card payments (Visa, Mastercard) are deferred to a future version.

Status

Approved

---

## Decision 010

### Minimal On-Chain Proof Payload

Stored on-chain per donation

* Donation ID
* Campaign ID
* SHA-256 proof hash (computed over donation ID, campaign ID, amount, receipt number, payment reference, timestamp)
* Timestamp

Rules

* Exactly one blockchain transaction per completed donation — never batched
* No wallet addresses, raw amounts or raw payment references on-chain
* Networks: Hardhat local (development), Sepolia (testing and demonstration), Mainnet or Layer 2 (future production)

Status

Approved

---

## Decision 011

### API Consolidation

* Payments own the donation flow: POST /api/payments/create-session, /callback, /status
* The Donations API is read-only (history, summary, details, receipt, verify)
* Blockchain recording and payment verification are internal services, never HTTP endpoints
* One canonical route per capability (dashboard, reports, blockchain status, beneficiaries)
* New public endpoint GET /api/stats for landing page statistics

Status

Approved

---

## Decision 012

### Repository Layer in Backend

Routes → Controllers → Services → Repositories → PostgreSQL

Server folders: config, controllers, database, middleware, repositories, routes, services, utils.

Status

Approved

---

## Decision 013

### Business Rule Resolutions

* Donor post-login destination is the campaign listing page
* Each beneficiary belongs to exactly one campaign and must be verified before public display
* Password reset (forgot/reset) ships in version 1
* Rate limiting on auth and payment endpoints ships in version 1
* Minimum donation amount is 1,000 TZS (named constant)
* Donations accepted only while a campaign is Active and within its dates; overfunding allowed; auto-complete after end date
* Campaigns may be flagged as Featured for the landing page

Status

Approved

---

## Decision 014

### Supporting Libraries

* Drizzle ORM over the pg driver — type-safe queries and migrations (refined in Decision 019)
* zod (validation, shared approach client and server)
* react-hot-toast (notifications)
* Recharts (dashboard charts)
* pdfkit (PDF receipts and reports)
* exceljs + csv-stringify (report exports)
* Nodemailer (SMTP email)
* express-rate-limit (rate limiting)
* JavaScript throughout — no TypeScript

Status

Approved

---

## Decision 015

### PostgreSQL Replaces SQLite

Supersedes Decision 001.

Reason

* Real money movement (donations and disbursements) needs safe concurrent writes
* Strong integrity, constraints and transactions
* Proper money handling (BIGINT whole TZS)
* Free managed hosting (e.g. Neon) makes deployment easier than persisting a SQLite file
* No migration debt later

Local development uses a local PostgreSQL instance or Docker. Access uses the pg driver with parameterized queries. No ORM.

Status

Approved

---

## Decision 016

### Fund Disbursement to Beneficiaries with Dual Approval

The system disburses raised funds from a campaign to its verified beneficiaries.

Model

* Admin initiates a fiat payout through the AzamPay disbursement API
* Disbursements at or above 1,000,000 TZS require approval from a second administrator
* The initiating administrator can never approve their own disbursement
* A disbursement can never exceed the campaign's available balance (total raised minus total disbursed)
* Every completed disbursement records an immutable blockchain proof, exactly like a donation
* Disbursement records are immutable and never deleted

Note on the evaluator's "automated disbursement via smart contracts with multi-signature approval": a smart contract can only move on-chain crypto, but our funds are fiat TZS held by the payment provider. This design honours the intent — automated payout workflow, dual-approval control for large amounts, and on-chain proof — using real money rails rather than simulated on-chain funds.

The dual-approval threshold is a named, configurable constant.

Status

Approved

---

## Decision 017

### Pull Selected Future Features into Version 1

The following items, previously marked "future", are now in scope for version 1 because they are low cost and high value:

* Refresh tokens with rotation and logout from all devices (gives the sessions table a real purpose)
* Account lockout after repeated failed logins
* Email notifications for key events (SMTP via Nodemailer)
* Public verification page (verify a donation or disbursement by receipt number, no account required)
* Dark mode / theme toggle
* Static testimonials on the landing page
* QR code on receipts and a QR donate entry point

The following remain future scope (genuine additional cost, not cheap wins):

* Multi-factor authentication
* SMS notifications (paid provider)
* Recurring and scheduled donations
* Card payments (Visa, Mastercard)
* Refunds
* Multi-currency
* Multi-NGO support
* AI fraud detection

Status

Approved

---

## Decision 018

### TypeScript Across the Entire Stack

The client, server and Hardhat tooling are written in TypeScript.

Reason

* The platform moves real money (donations and disbursements) across many typed data shapes
* Types catch field, shape and status errors at edit-time, before runtime
* The frontend/backend contract becomes self-documenting via shared types
* Chosen at the cheapest possible moment (immediately after scaffolding)

This supersedes the JavaScript references in the earlier frontend and backend documentation. Strict mode is enabled.

Status

Approved

---

## Decision 019

### Drizzle ORM for the Data Layer

The backend accesses PostgreSQL through Drizzle ORM over the node-postgres (pg) driver.

Reason

* Extends TypeScript type safety all the way to the database (Decision 018)
* Type-safe, SQL-shaped queries — transparent, with a minimal runtime
* Built-in migrations via drizzle-kit
* Still allows raw SQL when a query needs it

Schemas live in server/src/database/schema. Migrations are generated into server/src/database/migrations. This refines the data-access note in Decision 014.

Status

Approved

---

Future architectural decisions should be added to this document instead of modifying previous decisions.
