# CHAPTER THREE: PROJECT RESEARCH METHODOLOGY {-}

```{=latex}
\startchapter{3}
```

## 3.1 Introduction {-}

The project used applied systems development: early user-problem evidence was translated into requirements, then delivered through iterative implementation and technical verification.

## 3.2 Research Design {-}

An iterative Agile approach was used. The system was built in vertical stages: public campaigns, authentication, donations, blockchain proof, administration, community fundraising and payment/deployment improvements. A Google Forms questionnaire provided problem and preference themes; document review and observation supplemented it.

## 3.3 Study Area {-}

The context was Tanzania. The questionnaire was shared through Tanzania Red Cross Society cooperation chat groups and among students, focusing on donation trust, tracking and payment preferences.

## 3.4 Target Population and their Categories {-}

The intended population was potential donors, NGO stakeholders and students. Administrative workflows were analysed from the perspectives of a neutral NGO operator and a community fundraiser.

## 3.6 Sample Size {-}

The Google Form received 26 responses. Individual response rows and collection dates were not retained, only the aggregated per-question summary reproduced in Appendix A, so the sample supports directional themes rather than inferential findings. A future evaluation should retain anonymised response data, consent information and collection dates.

## 3.7 Data Collection Methods {-}

The questionnaire collected early user views. Document review examined requirements, platform documentation and donation-control literature. Observation examined expected platform behaviour and the developed application. Interviews were not used within the available project time.

## 3.8 Data Collection Instruments {-}

The instruments were a structured Google Forms questionnaire and document-review matrix. Questionnaire themes concerned trust, tracking, transparency, blockchain verification and donation management.

## 3.9 Data Required for Each Objective {-}

| Objective | Evidence | Method |
|---|---|---|
| Secure access | roles, sessions and access rules | source review and API tests |
| Donation workflow | payment, receipt and history | E2E tests |
| Proof | hash, transaction and lookup | contract/API tests |
| Accountable payout | beneficiary, balance and approval controls | business rules and E2E tests |
| Decision support | risk signals and review path | integrated risk-module code/tests |

Table: Table 3.1: Data required for each research objective {#tbl:data-required}

## 3.10 Ethical Considerations {-}

Participation was voluntary and findings are reported only as aggregate themes. Public verification returns campaign, amount, date and transaction reference but no donor identity, email or payment reference. On-chain data is a proof hash rather than personal data.

## 3.11 Data Analysis Methods {-}

The retained questionnaire findings were analysed thematically. Technical evidence was analysed through requirements traceability, source inspection, automated test results and manual workflow verification. No quantitative result is presented without its source data.

## 3.12 Development Methodology {-}

Agile development was appropriate because payments, blockchain and role controls have interdependencies. Each stage added a usable capability and was checked through linting, type checking, builds and targeted end-to-end tests. Git history preserves the iteration record.

## 3.13 Software and Hardware Used {-}

React, TypeScript, Vite and Tailwind CSS implement the client. Node.js, Express, Drizzle ORM and PostgreSQL implement the server. Solidity, Hardhat and Ethers implement blockchain proof. Development used Windows 11, VS Code, PowerShell, Git and npm; deployment targets are Vercel, Render and Neon PostgreSQL.

## 3.14 Summary {-}

The methodology combines user-problem themes with iterative implementation and reproducible technical verification, while explicitly acknowledging missing response-level survey data.
