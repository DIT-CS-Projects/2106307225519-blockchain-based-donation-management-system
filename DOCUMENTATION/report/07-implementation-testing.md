# CHAPTER SEVEN: SYSTEM IMPLEMENTATION, TESTING AND RESULTS {-}

```{=latex}
\startchapter{7}
```

## 7.1 Introduction {-}

ChangiaTanzania was implemented as a TypeScript web application with a separately tested Solidity proof contract.

## 7.2 Development Environment {-}

Development used Windows 11, Visual Studio Code, PowerShell, Git and npm. The client uses React/Vite; the API uses Express; PostgreSQL is accessed through Drizzle; contracts are built with Hardhat.

## 7.3 Software Tools Used {-}

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Node.js, Express, PostgreSQL, Drizzle ORM, Zod, Ethers, Solidity, Hardhat, ESLint and Git were used. CSV, Excel and PDF libraries support exports.

## 7.4 Implementation of Modules {-}

| Module | Capability | Requirements |
|---|---|---|
| Identity | registration, login, reset, sessions and RBAC | FR-01, FR-02 |
| Campaigns | public browsing and owner/admin management | FR-03, FR-04 |
| Donations | payment sessions, callback finalisation, receipts, history | FR-05, FR-06 |
| Proofs | deterministic hashes, registry writes and public verification | FR-07 |
| Payouts | beneficiary verification, balance and approvals | FR-08, FR-09 |
| Operations | notifications, dashboard, audit log and exports | FR-10 |
| Risk review | explainable rules, statistical signals, Isolation Forest and review queue | FR-11 |

Table: Table 7.1: Implementation of modules {#tbl:modules}

Payment finalisation is idempotent and precedes asynchronous proof recording; a chain failure cannot lose a verified donation and later verification can reconcile pending proof.

## 7.5 Testing Strategy {-}

Testing combines smart-contract unit tests, API end-to-end tests, client build/lint/type checks and manual browser workflows. Contract tests cover proof registration and duplicate rejection. API tests cover registration, authorisation, payment finalisation, proof lookup, campaign review, beneficiary verification, disbursement controls and reports. The integrated risk module adds analytics and Isolation Forest tests. Independent UAT and production load testing remain future work.

## 7.6 Test Cases {-}

| ID | Description | Input | Expected Result | Status |
|---|---|---|---|---|
| TC-01 | Registration | Valid credentials | Account/session created | Pass |
| TC-02 | Duplicate callback | Same reference twice | One donation and credit | Pass |
| TC-03 | Public proof lookup | Receipt number | Status without PII | Pass |
| TC-04 | Campaign review | Fundraiser submission | Not public before approval | Pass |
| TC-05 | Beneficiary control | Unverified beneficiary | Payout rejected | Pass |
| TC-06 | Separation of duties | Initiator approves own payout | Approval rejected | Pass |
| TC-07 | Balance control | Excess payout | Request rejected | Pass |
| TC-08 | Duplicate proof | Existing identifier | Contract rejects it | Pass |

Table: Table 7.2: Test case summary (full log in Appendix F) {#tbl:testcases}

## 7.7 Results {-}

The tested implementation satisfies the core workflow: donor payment, receipt, history and verification; controlled campaign and beneficiary management; and disbursements restricted by ownership, verification, balance and approval rules. The repository contains passing Hardhat and API test suites for these flows.

## 7.8 Discussion of Results {-}

The implementation is strongest where application controls and blockchain proof complement each other. Proof makes a completed event tamper-evident; database transactions, RBAC and audit logs control operations. It does not prove an off-chain beneficiary outcome. Current limits are live credentials, production hardening, controlled user evaluation and performance testing. The hybrid risk module is integrated and tested, but remains disabled until the database migration, operational review process and configuration are ready. The CharityVault contract remains separate experimental work and is not part of the deployed payment flow.

## 7.9 System Screenshots {-}

The final demonstration journey is sign-in, campaign browsing, payment, receipt/proof status and history. Administration evidence covers review, beneficiary verification, payout approval, audit records and exports. Screenshots should be captured from the final deployment immediately before submission so they cannot become stale.
