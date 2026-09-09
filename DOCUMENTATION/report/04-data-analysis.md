# CHAPTER FOUR: DATA ANALYSIS {-}

```{=latex}
\startchapter{4}
```

## 4.1 Introduction {-}

This chapter reports evidence available without overstating it: retained questionnaire themes, requirements analysis and reproducible technical tests.

## 4.2 Respondent Demographics {-}

The questionnaire was shared through Tanzania Red Cross Society cooperation chat groups and a student population (26 respondents). Individual demographic fields were not retained, so per-respondent breakdowns (age, gender, occupation) are not reproduced; the retained artefact is the aggregated response summary reproduced in Appendix A.

## 4.3 Analysis of Collected Data {-}

The retained questionnaire summary identified uncertain trust in existing NGO donation systems, difficulty tracking a donation after payment, demand for transparent tracking, support for blockchain-backed records, preference for mobile money, and demand for improved donation management. These are design inputs, not generalisable statistical estimates.

| Finding | ChangiaTanzania response |
|---|---|
| Uncertain trust | Public receipt verification and audit records |
| Tracking is difficult | Receipt, history, campaign progress and proof status |
| Transparency is expected | Verifiable donation and disbursement proofs |
| Local payment is preferred | Tanzanian payment-provider abstraction |
| Management needs improvement | Campaign, beneficiary, payout and reporting modules |

Table: Table 4.1: Retained questionnaire themes mapped to ChangiaTanzania's response {#tbl:themes}

## 4.4 Interpretation of Findings {-}

The evidence supports an accountability architecture rather than a payment page alone. It explains the system's payment-to-proof workflow, limited public verification view, and administrative controls around beneficiaries and payouts. It does not establish that blockchain itself causes trust.

## 4.5 Identified Problems {-}

The analysis identified insufficient post-donation visibility, limited traceability of fund use, reliance on privileged administration and mismatch between cryptocurrency-first platforms and local payment habits.

## 4.6 Functional Requirements Identified {-}

The resulting functional requirements are specified and traced in Section 5.4: access, campaigns, payments, history, proofs, beneficiaries, disbursements, reports, notifications and risk review.

## 4.7 Non-functional Requirements Identified {-}

Security, reliability, usability, maintainability, availability and scalability were identified as essential qualities. Section 5.5 converts them into testable acceptance targets.

## 4.8 Summary {-}

The available evidence supports a transparent, mobile-money-compatible workflow. The aggregated response summary (Appendix A) is directional evidence from a convenience sample of 26 respondents, not a statistically representative survey; it is used to motivate design themes rather than to support inferential claims.
