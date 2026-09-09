# CHAPTER FIVE: SYSTEM REQUIREMENT SPECIFICATION {-}

```{=latex}
\startchapter{5}
```

## 5.1 Introduction {-}

This chapter specifies what ChangiaTanzania must do and its operational constraints.

## 5.2 Existing System Analysis {-}

Manual records and generic online fundraising leave a weak link between payment acknowledgement, fund use and independently checkable evidence. Centralised data also needs governance controls to prevent a single user from creating and approving exceptional payouts.

## 5.3 Proposed System {-}

The proposed system combines a public interface, protected role workspaces, payment-provider adapters, PostgreSQL operations, Ethereum proof recording and report exports. It addresses visibility with receipts and proof lookup, and governance with beneficiary verification, approval rules and immutable audit logs.

## 5.4 Functional Requirements {-}

| ID | The system shall | Priority |
|---|---|---|
| FR-01 | register, authenticate and manage secure user sessions | High |
| FR-02 | enforce donor, fundraiser and administrator permissions | High |
| FR-03 | list, search and display active campaigns | High |
| FR-04 | let authorised owners create, edit, submit and archive campaigns | High |
| FR-05 | create payment sessions and finalise verified callbacks idempotently | High |
| FR-06 | issue receipts and show each donor's donation history | High |
| FR-07 | create and publicly verify donation and disbursement proofs | High |
| FR-08 | manage beneficiaries and restrict payouts to verified beneficiaries | High |
| FR-09 | enforce balance, threshold and self-approval rules for disbursements | High |
| FR-10 | notify users and provide dashboards, audit records and exports | Medium |
| FR-11 | provide an administrator risk-review API and queue for unusual completed donations | Medium |

Table: Table 5.1: Functional requirements {#tbl:fr}

## 5.5 Non-functional Requirements {-}

| Quality | Acceptance target / evidence |
|---|---|
| Security | bcrypt passwords, JWT access, rotating httpOnly refresh token, RBAC, validation and rate limits |
| Reliability | one atomic payment finalisation; duplicate callbacks do not double-credit |
| Privacy | public lookup exposes no donor PII or payment reference; no PII on-chain |
| Maintainability | strict TypeScript, layered API and provider interfaces |
| Usability | responsive client with loading, empty, error and success states |
| Availability | a proof-write failure does not discard a verified payment |
| Scalability | PostgreSQL pagination and constraints; production load testing remains required |

Table: Table 5.2: Non-functional requirements {#tbl:nfr}

## 5.6 User Requirements {-}

Donors need browsing, donation, receipts, history and verification. Fundraisers need controlled ownership of campaigns, beneficiaries and permitted payouts. Administrators need oversight, review, verification, reports, audit logs and user controls.

## 5.7 System Requirements {-}

The client requires a modern browser and internet connection. Server deployment requires Node.js 20+, PostgreSQL and protected secrets. Blockchain proof requires an Ethereum RPC endpoint, backend wallet and contract address. Development uses React, Vite, Express, Drizzle, Hardhat and Solidity.

## 5.8 Feasibility Study {-}

The solution uses mature tooling and preserves familiar fiat payments. Development and test deployment can use low-cost tiers and test ETH, but production must budget for gateway fees, storage, monitoring and gas. A production NGO must meet applicable payment, data-protection and charity regulations. The staged Git history demonstrates schedule feasibility.

## 5.9 Software Requirement Specification {-}

The human actors are Donor, Fundraiser and Administrator; the payment provider and Ethereum network are external systems. The functional requirements above are the formal SRS baseline and are traced in Chapter Seven.
