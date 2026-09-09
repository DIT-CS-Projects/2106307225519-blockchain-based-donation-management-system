# CHAPTER ONE: INTRODUCTION {-}

```{=latex}
\startchapter{1}
```

## 1.1 Background of the Study {-}

NGOs depend on credible stewardship of donations. Digital payment confirmation does not, by itself, show a donor whether a contribution was recorded correctly or whether later disbursement followed agreed controls. Tanzania is an appropriate setting for a locally usable solution because mobile money has expanded access to financial services [@worldbank2017]. Blockchain can preserve a verifiable record of material events, although it does not remove governance and privacy responsibilities [@sung2023; @howson2021].

ChangiaTanzania is a web-based donation management system. PostgreSQL is the operational source of truth; Ethereum stores minimal cryptographic proofs after verified payment or completed disbursement. Donors need no cryptocurrency wallet. The system supports donors, verified fundraisers and administrators, with campaign review, beneficiary verification, controlled disbursements, public receipt verification, reporting, notifications and audit records.

## 1.2 Problem Statement {-}

Conventional donation workflows often separate payment collection, campaign administration and utilisation reporting. A donor may receive an acknowledgement but lack an independent way to check the integrity of a later record or trace a completed disbursement. Cryptocurrency-first charity platforms can improve traceability but do not suit users who normally use local mobile-money services. The problem addressed is the absence of a practical, role-controlled platform that combines familiar Tanzanian payment rails with privacy-preserving, verifiable transaction proofs.

## 1.3 Aim of the Project {-}

To design and implement a blockchain-based NGO donation management system that improves transparency, accountability and secure administration of campaigns, donations and beneficiary disbursements while retaining familiar local payment workflows.

## 1.4 Specific Objectives {-}

1. To implement secure role-based access for donors, fundraisers and administrators.
2. To implement campaign, beneficiary and donation management with payment confirmation and downloadable receipts.
3. To record privacy-preserving proofs of completed donations and disbursements on Ethereum and provide public receipt verification.
4. To implement accountable fund release through beneficiary verification, balance checks, separation of duties, audit logging and reporting.
5. To implement decision support through explainable risk assessment, review queues, notifications and dashboards.

## 1.6 Scope of the Project {-}

The project delivers a responsive web system for registered NGOs and community fundraisers: account security, campaigns, beneficiaries, donations, payment-provider abstraction, receipts, notifications, reports, audit logs, public blockchain-proof lookup and an administrator risk-review queue. The hybrid risk assessment is integrated into the codebase but feature-flagged off until its database migration is applied and it is deliberately enabled. The system does not process cryptocurrency payments, store PII on-chain, provide a native mobile application, or claim production-mainnet use.

## 1.7 Significance of the Project {-}

Donors receive receipts, a personal history and a public verification route that reveals no donor identity. NGOs and fundraisers receive structured campaign, beneficiary and reporting workflows. Administrators receive separation-of-duties controls, audit records and exports. The work demonstrates a practical integration of conventional payment services, a relational application and public-chain proof without forcing users to understand wallets or digital assets.

## 1.8 Limitations {-}

The current public-chain configuration is a test environment; live merchant credentials and production chain custody are outside this report. Local uploads should be replaced by durable object storage before production. Cloud free-tier cold starts can affect initial latency. The response-level questionnaire export is unavailable, so this report presents only its documented themes and does not invent quantitative results.
