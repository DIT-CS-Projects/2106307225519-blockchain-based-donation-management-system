# CHAPTER TWO: LITERATURE REVIEW {-}

```{=latex}
\startchapter{2}
```

## 2.1 Introduction {-}

This chapter reviews the concepts and prior systems that inform ChangiaTanzania, distinguishing a blockchain proof ledger from the operational database.

## 2.2 Theoretical Literature Review {-}

Blockchain is a replicated ledger whose records are cryptographically linked. In this project its role is deliberately narrow: a hash of a completed event can later be reconciled without publishing personal data. Donation-traceability research identifies immutable event records and end-to-end traceability as a response to uncertainty over charitable funds [@alabdulkarim2022]. Sung et al. found that transparency, immutability and efficiency features of a blockchain donation system improved perceived nonprofit trustworthiness [@sung2023].

Technology is not a substitute for governance. Howson identifies trade-offs between transparency, power and beneficiary interests in crypto-giving [@howson2021]. ChangiaTanzania therefore holds personal and operational data off-chain, exposes only a restricted verification result, and uses role separation and audit logs for governance.

## 2.3 Empirical Literature Review {-}

Charity frameworks commonly emphasise traceability, notification and auditable histories [@muneeb2020; @alabdulkarim2022]. Their cryptocurrency orientation creates an adoption mismatch for a mobile-money context. World Bank analysis describes Tanzania's mobile-money expansion as a major contributor to financial inclusion [@worldbank2017]. ChangiaTanzania consequently verifies a fiat payment first, then creates a database donation and records its proof asynchronously.

## 2.4 Existing Systems Review {-}

Generic crowdfunding platforms demonstrate campaign pages, online collection and receipts, but their operational controls are not necessarily visible to an individual donor. Blockchain charity frameworks offer stronger traceability but frequently assume cryptocurrency payment and wallet use [@muneeb2020]. Neither pattern alone combines local fiat-payment abstraction, beneficiary verification, campaign-owner controls, cumulative self-release limits and privacy-preserving public proof lookup.

## 2.5 Project Research Gap {-}

The gap is an implementable accountability workflow that does not move ordinary donors into cryptocurrency. ChangiaTanzania keeps donation value off-chain, makes PostgreSQL the authoritative operational record, and anchors a deterministic proof hash only after verified completion. Its fund-release workflow adds governance that a proof alone cannot supply.

## 2.6 Proposed System {-}

A donor browses an active campaign, starts a payment session and receives a receipt after a verified callback. The transaction is committed atomically, totals are updated and an asynchronous service records proof. Fundraisers own their campaigns but cannot publish without approval; beneficiaries remain administrator-verified; disbursements are constrained by available balance and approval rules.

## 2.7 Conceptual Framework {-}

Inputs are credentials, campaign data, payment callbacks and payout requests. Processing validates input, applies roles and business rules, writes PostgreSQL transactions, produces notifications and queues proof recording. Outputs are receipts, dashboards, exports, audit entries and verification results. Public verification, administrative reviews and risk assessments form the feedback loop.

## 2.8 Strengths of the Proposed System {-}

Key strengths are familiar payment journeys, operational data separated from immutable proof data, role-based governance, idempotent payment finalisation, public verification without PII disclosure and provider abstraction. A pending chain write never blocks a successfully verified payment and can later be reconciled.
