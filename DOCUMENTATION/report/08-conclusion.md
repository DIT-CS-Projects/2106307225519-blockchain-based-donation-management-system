# CHAPTER EIGHT: CONCLUSION AND RECOMMENDATIONS {-}

```{=latex}
\startchapter{8}
```

## 8.1 Summary {-}

ChangiaTanzania applies familiar web and mobile-money-oriented donation workflows alongside blockchain proofs and administrative controls. The work covers the complete operational path from campaign publication to donation, receipt, proof verification, beneficiary management, controlled disbursement, audit record and export.

## 8.2 Achievement of Objectives {-}

The project achieved secure role access through authentication and RBAC; donation management through payment sessions, idempotent callbacks and receipts; transparency through deterministic on-chain proofs and public lookup; accountability through beneficiary, balance and approval controls; and administrative support through dashboards, reports, notifications, audit records and an integrated risk-review capability. The risk feature remains disabled pending migration and operational activation.

## 8.3 Conclusion {-}

The system shows that blockchain can be useful as a restrained proof mechanism rather than a replacement for normal payment and database infrastructure. Transparency improves when verifiable records are combined with privacy protection, operational auditability and separation of duties. The implementation is a credible foundation for NGO donation management but requires formal operational rollout work before production financial use.

## 8.4 Recommendations {-}

Before production deployment, the project should complete payment-provider certification, replace local file storage, introduce monitoring and backup procedures, perform independent security and load tests, and conduct structured end-user acceptance testing with retained consent and survey data.

## 8.5 Future Work {-}

Future work should evaluate the hybrid fraud/risk module with sufficient real donation history and reviewed outcomes, consider the CharityVault escrow/multisignature contract only after governance review, move proofs to an appropriate production network, add durable object storage and expand accessibility and mobile support. Mainnet use should follow security audit, key-management and compliance preparation rather than being enabled solely because the code exists.
