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

## Decision 020

### Community Fundraisers with Campaign Ownership and Threshold Self-Serve Disbursement

The platform opens beyond a single admin-run NGO. Any verified person with a legitimate cause can raise funds. This refines the two-role model in BUSINESS_RULES and the admin-only disbursement authority in Decision 016. It is not multi-NGO tenancy (Decision 017 keeps that future scope); it is community fundraising on one platform, with administrators acting as neutral operators.

Roles

* Three roles: donor, fundraiser, admin.
* A donor upgrades to fundraiser through an application with identity details, approved by an administrator. This is the "reasonable cause" gate and the future home for KYC.
* Administrators are the neutral platform operators and there may be several. An administrator can promote a user to administrator, so admin is no longer only a single seeded account.

Campaign ownership

* Every campaign has an owner. A fundraiser owns and manages only the campaigns they create; administrators manage all campaigns.
* Fundraiser-created campaigns start in Pending Review and go live only after an administrator approves them. An administrator may reject with a reason. Administrator-created campaigns may publish directly.

Beneficiaries

* A fundraiser may add beneficiaries to their own campaigns, but verification stays administrator-only. No payout can reach an unverified beneficiary.

Disbursement authority (refines Decision 016)

* A fundraiser may initiate a payout from their own campaign to a verified beneficiary of that campaign.
* The dual-approval threshold (1,000,000 TZS, the same named constant) now applies to the cumulative amount a fundraiser has self-released on a campaign, not to a single payout. While the running self-released total on the campaign stays below the threshold, payouts release without administrator approval. The payout that would cross the threshold, and every payout after it on that campaign, requires approval from an administrator (never the initiator).
* Administrator-initiated payouts keep the existing rule: a second administrator approves at or above the threshold.
* Available balance, on-chain proof, immutability, and the "approver is never the initiator" rule are unchanged.

Separation of duties (invariant)

* The party who benefits from a payout can never be the one who releases it beyond the self-serve allowance. Administrator-verified beneficiaries combined with the cumulative cap prevent a fundraiser from draining a campaign to a fabricated payee.

Status

Approved

---

## Decision 021

### Direct Fundraiser Registration

Refines Decision 020 and supersedes the "public registration creates donors only" rule from Decision 013 for the fundraiser role.

A person chooses their account type at registration: donor or fundraiser. Choosing fundraiser creates the account with the fundraiser role immediately. There is no separate application or administrator approval step for self-registration.

This is safe because every action that could cause harm still passes an administrator gate downstream:

* A fundraiser's campaign starts in Pending Review and is not public until an administrator approves it.
* A beneficiary must be verified by an administrator before any payout.
* Payouts that reach the cumulative self-serve cap require administrator approval.

Fundraiser registration collects the same identity and cause details as the fundraiser application (the name they fundraise under, their cause, and a national ID or registration number) and records them as an auto-approved fundraiser application, so the identity trail and the future home for KYC are preserved.

The donor-to-fundraiser application flow (Decision 020) remains for existing donors who want to upgrade. Administrators are still never self-assignable: they are provisioned by the seed script or promoted by another administrator.

Status

Approved

---

## Decision 022

### Impact Points (donor rewards)

Donors earn Impact Points, an off-chain loyalty currency, for engagement. Points recognize and encourage giving; they are never money, never redeemable for cash, and never leave the platform. They are deliberately kept off-chain: they are operational data, not proof, so they belong in PostgreSQL, not on the blockchain (per the blockchain philosophy, "Blockchain stores proof only").

Points are recorded as an append-only ledger (`reward_events`), mirroring the immutability of donation history. A donor's balance and tier are always derived by summing the ledger, so the balance can never drift from the history.

Earning rules (one source of truth in the reward service, surfaced to the client via the API so copy never drifts):

* 1 point per 1,000 TZS donated, with a minimum of 1 point per donation.
* A one-time 100-point bonus on a donor's first ever donation.
* A 50-point bonus each time a donor supports a campaign they had not backed before (rewarding breadth of engagement, not just repetition).

Tiers are derived from the lifetime balance: Bronze (0), Silver (500), Gold (2,000), Platinum (5,000).

Awarding happens inside the payment success flow, fire-and-forget, exactly like blockchain proof recording: a rewards failure is logged and never affects the donation. Awarding is idempotent (unique `donation_id`, `type`), so a duplicate payment callback never double-awards.

This decision does not change the payment, donation, or blockchain flows; it only reads from donations and appends to its own ledger.

Status

Approved

---

## Decision 023

### No Minimum Donation Amount

Supersedes the minimum-donation clause of Decision 013 ("Minimum donation amount is 1,000 TZS").

There is no minimum donation amount. A donor may give any whole-shilling amount above zero. The named constant `MIN_DONATION_TZS` is removed from both the client and server; the only remaining amount guardrail is the existing upper bound (`MAX_DONATION_TZS`), which catches fat-finger input and is unrelated to this decision.

This lowers the barrier to a donor's first gift, consistent with the platform's calm-confidence positioning: nobody is turned away for giving what they can. Impact Points (Decision 022) already round up to a 1-point minimum per donation, so even the smallest gift is recognized.

Status

Approved

---

## Decision 024

### Fundraisers and Donors Are Separate Actors, Approved by an Administrator

Revises Decision 020 (donor upgrades to fundraiser via an approved application) and completes Decision 021 (direct fundraiser registration).

Donor and fundraiser are two distinct actors. There is no conversion between them and no in-app role promotion of any kind:

* A donor cannot "become" a fundraiser. The donor account page no longer offers an application, and the donor-only apply endpoint is removed. Someone who wants to fundraise registers a fundraiser account.
* Administrators are no longer promoted from within the app. The "Make admin" action is removed; an administrator is created only by the seed script. Public registration still can never create an administrator.

A fundraiser is chosen at registration and holds the `fundraiser` role from sign-up, but the account is not usable until an administrator approves it. On sign-up the fundraiser's identity is captured as a pending `fundraiser_applications` row (previously auto-approved). Until approval:

* The fundraiser can sign in and reach their dashboard, which shows a locked "under review" state.
* Creating a campaign is blocked in the service layer (`assertFundraiserApproved`), not just hidden in the UI.

Administrators approve fundraisers in a dedicated Fundraisers console: a directory of fundraiser accounts (identity, approval status, account status, campaigns and total raised) with the approval queue built in, plus account suspend/activate. Campaign review is unchanged and stays on the Reviews page: an approved fundraiser's individual campaigns are still reviewed before going live.

No database migration is required. The existing `fundraiser_applications` table and `user_status` enum carry the new semantics; existing self-registered fundraisers (auto-approved under Decision 021) are grandfathered as approved.

Status

Approved

---

## Decision 025

### Phone Numbers Are Not Unique Per Account

A household or shared line is common; requiring a distinct phone number per account blocked legitimate registrations for no fraud-prevention benefit (phone is not an auth factor here).

Multiple accounts, donor or fundraiser, may share the same phone number. The `users_phone_unique` index is dropped and the registration and profile-update conflict checks (`phoneExists`) are removed. Email and username remain unique.

Status

Approved

---

## Decision 026

### Username Is Required at Registration

Completes email-or-username sign-in. Sign-in by username was already supported, but registration left the handle optional, so most accounts had no username to sign in with.

Every new account chooses a username at registration (3-30 characters, letters/numbers/underscore, stored lowercased, unique). Either the email or the username can then be used to sign in. The `users.username` column stays nullable so accounts created before this decision are grandfathered; only new registrations are required to supply one.

Status

Approved

---

Future architectural decisions should be added to this document instead of modifying previous decisions.
