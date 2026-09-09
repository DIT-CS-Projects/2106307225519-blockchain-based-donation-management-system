# FINAL YEAR PROJECT REPORT BLUEPRINT

Distilled from:
- `DOCUMENTATION/RECCOMENDED FINAL YEAR PROJECT REPORT FORMAT.pdf` (Computer Studies Department, 8-chapter report format)
- `DOCUMENTATION/MINI 2 Presentation_Guideline_Template.pptx` (29 slides, covers Chapters 5 to 7 only)

Read this file instead of re-parsing the PDF or PPTX. It is the authoritative structure for the report deliverable.

Project: **Changia**, a Blockchain-Based NGO Donation Management System.
Live system: frontend on Vercel, API on Render, PostgreSQL on Neon, `TransparencyRegistry.sol` on Ethereum Sepolia.

---

## 1. Output Rules (non-negotiable)

| Rule | Value |
|---|---|
| Reference style | APA 7th edition (latest), author-date in text, hanging-indent reference list |
| Heading colour | Black for **every** heading level, no accent colours, no coloured chapter titles |
| Deliverable | PDF (build from Markdown sources, also emit .docx for supervisor markup) |
| Body font | Times New Roman 12pt (confirm with supervisor) |
| Line spacing | 1.5 (confirm with supervisor) |
| Page numbers | Roman numerals for preliminary pages, Arabic from Chapter One |
| Figures/Tables | Numbered per chapter (Figure 6.1, Table 5.2), captioned, cross-referenced in text |
| Citations | Real, verifiable sources only. No invented references, no fabricated DOIs. |

---

## 2. Required Structure (verbatim from the source PDF)

### Preliminary Pages
Cover Page · Title Page · Declaration · Certification · Dedication · Acknowledgements · Abstract · Table of Contents · List of Figures · List of Tables · List of Abbreviations · List of Appendices

### CHAPTER ONE: INTRODUCTION
- 1.1 Background of the Study
- 1.2 Problem Statement
- 1.3 Aim of the Project
- 1.4 Specific Objectives
- 1.6 Scope of the Project *(source PDF skips 1.5)*
- 1.7 Significance of the Project
- 1.8 Limitations

### CHAPTER TWO: LITERATURE REVIEW
- 2.1 Introduction
- 2.2 Theoretical Literature Review
- 2.3 Empirical Literature Review
- 2.4 Existing Systems Review *(detailed description, block diagram, weaknesses)*
- 2.5 Project Research Gap
- 2.6 Proposed System
- 2.7 Conceptual Framework *(detailed architecture of the functioning system)*
- 2.8 Strengths of the Proposed System

### CHAPTER THREE: PROJECT RESEARCH METHODOLOGY
- 3.1 Introduction
- 3.2 Research Design
- 3.3 Study Area
- 3.4 Target Population and their Categories
- 3.6 Sample Size *(source PDF skips 3.5)*
- 3.7 Data Collection Methods: Interviews · Questionnaires · Observation · Document Review
- 3.8 Data Collection Instruments
- 3.9 Data Required for Each Objective
- 3.10 Ethical Considerations
- 3.11 Data Analysis Methods
- 3.12 Development Methodology *(SDLC model used: Agile, Waterfall, Spiral, Prototyping)*
- 3.13 Software and Hardware Used
- 3.14 Summary

### CHAPTER FOUR: DATA ANALYSIS
- 4.1 Introduction
- 4.2 Respondent Demographics
- 4.3 Analysis of Collected Data *(from questionnaires, interviews, observation, existing documents; present with tables, charts, graphs, pie charts)*
- 4.4 Interpretation of Findings
- 4.5 Identified Problems
- 4.6 Functional Requirements Identified
- 4.7 Non-functional Requirements Identified
- 4.8 Summary

### CHAPTER FIVE: SYSTEM REQUIREMENT SPECIFICATION
- 5.1 Introduction
- 5.2 Existing System Analysis
- 5.3 Proposed System
- 5.4 Functional Requirements
- 5.5 Non-functional Requirements *(Security, Performance, Reliability, Maintainability, Availability, Scalability, Usability)*
- 5.6 User Requirements
- 5.7 System Requirements *(Hardware, Software, Network, Model/ML and algorithms)*
- 5.8 Feasibility Study *(Technical, Economic, Operational, Legal, Schedule)*
- 5.9 Software Requirement Specification *(SRS, use-case diagram)*

### CHAPTER SIX: SYSTEM DESIGN
- 6.1 Introduction
- 6.2 System Architecture
- 6.3 Data Modeling
  - 6.3.1 Context Diagram
  - Data Flow Diagrams: Context Diagram · Level 0 · Level 1
- 6.4.1 Database Design *(source PDF has no parent 6.4)*: ERD · Database Schema · Data Dictionary · Table Structures
- 6.5 Process Modeling
  - 6.5.1 UML Models: Use Case Diagram · Use Case Descriptions · Activity Diagram · Sequence Diagram · Class Diagram · State Diagram (optional) · Deployment Diagram · Component Diagram
- 6.7 User Interface Design *(source PDF skips 6.6)*: Login Screen · Dashboard · Forms · Reports
- 6.8 Hardware or Automation Design *(if applicable)*
- 6.9 Machine Learning and Dataset Design *(if applicable)*
- 6.9 Algorithms of the Working System *(source PDF reuses 6.9)*
- 6.10 Flowcharts of the Working System
- 6.11 Security Design *(if applicable)*

### CHAPTER SEVEN: SYSTEM IMPLEMENTATION, TESTING AND RESULTS
- 7.1 Introduction
- 7.2 Development Environment
- 7.3 Software Tools Used
- 7.4 Implementation of Modules
- 7.5 Testing Strategy *(Unit, Integration, System, User Acceptance)*
- 7.6 Test Cases
- 7.7 Results
- 7.8 Discussion of Results
- 7.9 System Screenshots

### CHAPTER EIGHT: CONCLUSION AND RECOMMENDATIONS
- 8.1 Summary
- 8.2 Achievement of Objectives
- 8.3 Conclusion
- 8.4 Recommendations
- 8.5 Future Work

### REFERENCES
APA 7th edition.

### APPENDICES
Questionnaire · Interview Guide · Source Code (selected excerpts) · User Manual · Installation Guide · Test Cases · Gantt Chart · Budget · Additional Screenshots

---

## 3. Numbering Anomalies in the Source Template

The department PDF has four numbering defects. Decision required before drafting (see Section 7).

| Location | Defect |
|---|---|
| Chapter 1 | 1.4 jumps to 1.6, no 1.5 |
| Chapter 3 | 3.4 jumps to 3.6, no 3.5 |
| Chapter 6 | 6.4.1 exists with no parent 6.4; 6.5 jumps to 6.7, no 6.6 |
| Chapter 6 | "6.9" used twice (ML/Dataset Design and Algorithms of the Working System) |

**Default position:** mirror the template exactly, including the gaps, so a marker ticking section numbers against the rubric finds every expected number where they expect it. Only exception is the duplicated 6.9, where the second occurrence becomes 6.9.1 to keep the ToC valid.

---

## 4. Presentation Template (MINI 2)

29 slides, scoped to **Chapters 5, 6 and 7 only**. Structure:

| Slides | Content |
|---|---|
| 1 | Title: project title, department/programme, student name and ID, supervisor, date, DIT logo |
| 2 | Roadmap: what the deck covers (05, 06, 07) |
| 3 to 10 | Chapter 5: intro, proposed system, FRs, NFRs, system requirements, feasibility, use-case diagram |
| 11 to 20 | Chapter 6: intro, architecture, data modeling, database design, UML models, UI design, hardware/ML, flowchart, security design |
| 21 to 28 | Chapter 7: intro, dev environment and tools, modules, testing strategy, test cases table, results and discussion, 4 to 6 screenshots |
| 29 | Thank you, questions |

Instructions embedded in the template that affect how we write the report:
- Number functional requirements **FR-01, FR-02 ...** so each traces to a test case in Chapter 7.
- Give **one measurable target per non-functional requirement**.
- Map **each module in 7.4 back to the FR ids** it fulfils.
- Omit hardware/ML sub-sections entirely if not applicable, do not leave placeholders.
- Reference the Security NFR from 5.5 inside 6.11 to show traceability.
- Test case table columns: Test ID · Description · Input · Expected Result · Status.
- Screenshots follow one user journey: login → core feature → output/report.
- Be honest about limitations in 7.8, examiners value critical reflection.
- Pace each chapter at 3 to 5 minutes, lead with diagrams and screenshots.

---

## 5. Source Material Map (repo → report section)

Legend: **READY** (content exists, needs rewriting into academic prose) · **PARTIAL** (some material, gaps remain) · **GAP** (nothing exists yet)

| Report section | Repo source | Status |
|---|---|---|
| 1.1 Background | `docs/PROJECT_OVERVIEW.md`, `docs/PRODUCT.md` | PARTIAL, needs cited context on Tanzanian NGO sector |
| 1.2 Problem Statement | `docs/PROJECT_OVERVIEW.md` Introduction | PARTIAL, needs cited evidence |
| 1.3, 1.4 Aim, Objectives | `docs/PROJECT_OVERVIEW.md` Project Objectives, `docs/EVALUATOR_REQUIREMENTS.md` | READY |
| 1.6 Scope | `docs/PRODUCT_REQUIREMENTS.md`, `docs/ROADMAP.md` | READY |
| 1.7 Significance | `docs/PROJECT_MANIFESTO.md`, `docs/EVALUATOR_REQUIREMENTS.md` | READY |
| 1.8 Limitations | `docs/CURRENT_PROGRESS.md`, `docs/DECISION_LOG.md` | READY |
| 2.2, 2.3 Theoretical, Empirical review | none | **GAP**, needs 15 to 25 real APA 7 sources |
| 2.4 Existing Systems Review | none | **GAP**, review GiveDirectly/Binance Charity/M-Changa/GoFundMe, block diagram + weaknesses |
| 2.5 Research Gap | none | **GAP**, derives from 2.4 |
| 2.6 Proposed System | `docs/PROJECT_OVERVIEW.md`, `docs/SYSTEM_ARCHITECTURE.md` | READY |
| 2.7 Conceptual Framework | `docs/SYSTEM_ARCHITECTURE.md`, `docs/BLOCKCHAIN_ARCHITECTURE.md` | READY, needs diagram |
| 2.8 Strengths | `docs/DECISION_LOG.md` | READY |
| 3.2 to 3.11 Research design, population, sample, instruments, ethics, analysis | none | **GAP**, blocked on primary data collection |
| 3.12 Development Methodology | `docs/IMPLEMENTATION_PLAN.md`, `docs/ROADMAP.md`, `docs/GITHUB_WORKFLOW.md`, git history | READY, stage-based iterative/Agile |
| 3.13 Software and Hardware Used | `docs/TECH_STACK.md` | READY |
| 4.1 to 4.8 Data Analysis | none | **GAP**, blocked on primary data collection |
| 5.2 Existing System Analysis | none | **GAP**, overlaps 2.4 |
| 5.3 Proposed System | `docs/PROJECT_OVERVIEW.md` | READY |
| 5.4 Functional Requirements | `docs/PRODUCT_REQUIREMENTS.md`, `docs/BUSINESS_RULES.md`, `api/*.md` | READY, needs FR-xx ids |
| 5.5 Non-functional Requirements | `docs/PRODUCT_REQUIREMENTS.md`, `docs/SECURITY.md` | PARTIAL, needs measurable targets |
| 5.6 User Requirements | `docs/EVALUATOR_REQUIREMENTS.md`, `pages/*.md` | READY |
| 5.7 System Requirements | `docs/TECH_STACK.md`, `deployment/production.md` | READY, ML sub-section not applicable, omit |
| 5.8 Feasibility Study | `deployment/RUNBOOK.md`, `docs/DECISION_LOG.md` | PARTIAL, needs cost and schedule figures |
| 5.9 SRS use-case diagram | `pages/*.md`, `flows/*.md` | PARTIAL, diagram not drawn |
| 6.2 System Architecture | `docs/SYSTEM_ARCHITECTURE.md`, `docs/BACKEND_ARCHITECTURE.md`, `docs/FRONTEND_ARCHITECTURE.md` | READY, needs diagram |
| 6.3 Context Diagram, DFD L0/L1 | `flows/*.md` | PARTIAL, diagrams not drawn |
| 6.4.1 ERD, Schema, Data Dictionary | `database/DATABASE_SCHEMA.md`, `server/src/database/schema/*.ts`, 11 migrations | READY, ERD not drawn |
| 6.5.1 UML models | `flows/*.md`, `api/*.md` | PARTIAL, no diagrams drawn |
| 6.7 UI Design | `pages/*.md`, `docs/DESIGN.md`, `docs/DESIGN_SYSTEM.md`, live site | READY, needs screenshots |
| 6.8 Hardware/Automation | not applicable | OMIT |
| 6.9 ML and Dataset | fraud-detection module, designed not built | **WRITE IT** as design-stage, see `DELIVERABLES_SYNC.md` S1 |
| 6.9.1 Algorithms | `docs/BUSINESS_RULES.md` (dual approval, reward points, threshold self-serve) | READY, needs pseudocode |
| 6.10 Flowcharts | `flows/payment-flow.md`, `flows/disbursement-flow.md`, `flows/blockchain-flow.md` | READY, needs diagrams |
| 6.11 Security Design | `docs/SECURITY.md` | READY |
| 7.2, 7.3 Environment and Tools | `docs/TECH_STACK.md`, `docs/PROJECT_STRUCTURE.md` | READY |
| 7.4 Implementation of Modules | `server/src/services/*` (21 services), `client/src/pages/*` (35 pages), `contracts/` | READY, needs FR mapping |
| 7.5 Testing Strategy | `testing/testing-plan.md`, `testing/acceptance-tests.md`, `testing/manual-testing.md` | PARTIAL, unit/integration automation thin |
| 7.6 Test Cases | `testing/acceptance-tests.md`, Stage 7 backend E2E 40/40 | PARTIAL, needs formatted table |
| 7.7, 7.8 Results, Discussion | none | PARTIAL, needs metrics run |
| 7.9 Screenshots | live deployment | GAP, needs capture pass |
| 8.1 to 8.5 Conclusion | `docs/CURRENT_PROGRESS.md`, `docs/ROADMAP.md` | READY |
| Appendix: Source code excerpts | repo | READY |
| Appendix: User Manual, Installation Guide | `README.md`, `deployment/RUNBOOK.md` | PARTIAL |
| Appendix: Gantt Chart | git history, `docs/ROADMAP.md` | READY, chart not drawn |
| Appendix: Budget | none | GAP, small table needed |
| Appendix: Questionnaire, Interview Guide | none | **GAP**, blocked on Chapter 3 decision |

### Current implementation facts (for Chapters 5 to 7)

- 13 database schema modules, 11 applied migrations: users, sessions, passwordResets, campaigns, donations, disbursements, beneficiaries, blockchain, notifications, auditLogs, rewards, fundraiserApplications.
- 15 controllers, 21 services, 15 route modules, repository layer, layered Controller → Service → Repository → Database.
- 35 client pages including 14 admin console pages, 3 fundraiser console pages.
- 1 Solidity contract, `TransparencyRegistry.sol`, deployed to Sepolia, with a Hardhat test suite.
- 3 user roles: donor, fundraiser, admin. Dual admin approval on large disbursements.
- Payments: mock provider plus AzamPay mobile money adapter behind a provider seam.
- Deployed and reachable in production.

---

## 6. Long-lead Items (start these first)

1. **Primary data collection** (Chapters 3 and 4). Everything else can be drafted from the repo. This cannot.
2. **Literature sources** (Chapter 2). Needs real, retrievable APA 7 references.
3. **Diagram set** (Chapter 6). About 12 diagrams.
4. **Screenshot pass** (Chapter 7, Appendix). Needs a stable seeded state on the live system.

---

## 7. Decisions

Settled 2026-07-29.

| # | Decision | Resolution |
|---|---|---|
| D1 | Order of deliverables | **MINI 2 deck first** (Chapters 5 to 7), full report after. Deck content is written to be reusable as report prose. |
| D2 | Numbering | **Mirror the template exactly**, gaps included. Only fix: duplicate 6.9 becomes 6.9.1 for the second occurrence. |
| D3 | Chapter 3/4 primary data | **Reuse the MINI 1 questionnaire (option A).** Form located and confirmed live by the user 2026-07-29. Document review is now a supporting method, not the primary one. Blocked only on the CSV export. |
| D4 | Build toolchain | Pandoc to DOCX and PDF, reference docx for fonts and all-black headings, APA 7th CSL. Deck built with python-pptx on top of the supplied MINI 2 template. |
| D5 | Diagram tool | **Confirmed against `DELIVERABLES_SYNC.md` S2.** Mermaid sources in `DOCUMENTATION/diagrams/*.mmd` are the single source of truth. Report uses the rendered PNGs. Deck uses the same PNGs at 3x, except three slides drawn as native PowerPoint shapes (architecture layers, working-system flowchart, use case diagram). |
| D6 | Institution details | User supplying. Pending values listed in Section 9. |

### D3-revised, reopened 2026-07-29

"Document review only" was chosen on the understanding that no primary data existed. MINI 1 shows that it does: a Google Form questionnaire was already distributed to Tanzania Red Cross Society cooperation chat groups and to fellow students, and five findings were reported from it (Section 10).

**RESOLVED to option A, 2026-07-29.** The user confirmed the form is live and editable:

```
https://docs.google.com/forms/d/1VPI-fJIv3F7WY7Uj9Gl0IkxpoNsl8LhWtfX9DwmS374/edit#responses
```

Chapter 3 is a survey design with document review as a supporting method. Chapter 4 reports real respondents, real sample size and real distributions. Option C below is retained only as a record of the discarded fallback and **does not apply**.

**Still needed from the user.** Neither session can read that URL, since an `/edit#responses` link requires the owner's Google login. Export from the Responses tab (three-dot menu, "Download responses (.csv)") and save to `DOCUMENTATION/data/mini1-questionnaire-responses.csv`. Also note the response count and the collection window, both required for 3.6 Sample Size.

Option B (reopen the form for a second wave to raise n and add questions MINI 1 did not ask) stays available once the CSV shows what was actually asked and how many replied.

### D3 consequences (document review only, option C)

Chapter 3 becomes a documentary research design and Chapter 4 becomes secondary-data analysis. Adjustments required:

- **3.4 Target Population** reframes from human respondents to a document population (NGO annual and financial reports, sector transparency publications, existing donation platform documentation).
- **3.6 Sample Size** becomes the count of documents and systems reviewed, with stated inclusion and exclusion criteria.
- **3.7 Data Collection Methods** keeps Document Review and Observation (direct observation of existing platforms in use). Interviews and Questionnaires are declared as not used, with justification, rather than silently dropped.
- **3.8 Instruments** becomes a document review matrix and an observation checklist.
- **4.2 Respondent Demographics** has no respondents. Reframe as a profile of the document and system corpus (source type, origin, year, scope), still rendered as tables and charts so the chapter meets the template's visual expectation.
- **4.3 Analysis** draws on published transparency and donor-trust data plus a structured feature and weakness audit of existing systems.
- **7.5 User Acceptance Testing** loses its natural respondent pool. Substitute: structured acceptance walkthrough against `testing/acceptance-tests.md` on the live deployment, reported honestly as developer-executed UAT rather than end-user UAT.
- **Appendices** drop Questionnaire and Interview Guide. Substitute: Document Review Matrix and Observation Checklist.
- This is a defensible design for a systems-development project, but expect a viva question on why no primary data was collected. Prepare the justification in 3.2.

No impact on the MINI 2 deck, which covers Chapters 5 to 7 only.

---

## 8. Relationship to the MINI 2 Deck

The deck is **not** covered by this file. It has its own blueprint: `DOCUMENTATION/PRESENTATION_BLUEPRINT.md`, which owns the template design tokens, the 29-slide template map, the planned Changia deck outline, visual direction, verified project facts for slide content, the python-pptx build toolchain and the regeneration protocol.

Division of ownership:

| Concern | Owner |
|---|---|
| 8-chapter report structure, APA 7 rules, section numbering, source-material map | this file |
| MINI 2 slide plan, deck visual system, pptx build scripts, screenshot capture | `PRESENTATION_BLUEPRINT.md` |
| Institution and candidate details, MINI 1 reconciliation, consistency risks | this file (Sections 9 and 10) |

Both files must agree on facts. `PRESENTATION_BLUEPRINT.md` Section 7 holds the verified project statistics and E2E results; treat it as the single source for those numbers rather than restating them here.

**Content rule for the deck:** because D1 puts the deck first, every slide's speaking content should be written so it lifts directly into the matching report section later. Chapter 5 slides feed report 5.x, Chapter 6 slides feed 6.x, Chapter 7 slides feed 7.x. This avoids a second writing pass.

---

## 9. Institution and Candidate Details (D6)

Sourced from the MINI 1 submission, `DOCUMENTATION/NASIBU Y ISAKA 2106307225519.pdf`.

| Field | Value |
|---|---|
| Institute | Dar es Salaam Institute of Technology |
| Department | Department of Computer Studies |
| NTA Level | 8 |
| Module | Project Realization |
| Module code | COU 08204 |
| Course | BENG22COE |
| Candidate name | Nasibu Y. Isaka |
| Registration number | 2106307225519 (confirmed by user 2026-07-29, the `I` on the MINI 1 cover is a typo) |
| Supervisor | Dr Gustaph Sanga |
| Project title | Blockchain-Based NGO Donation Management System |
| Submission / presentation date | _pending_ |
| Academic year | _pending_ |
| Institute logo file | _pending_ (deck slide 1 has a text placeholder "DIT-LOGO") |

**Registration number settled.** `2106307225519`, all digits. The MINI 1 cover page rendering of `2I06307225519` is a typo and must not be carried forward.

Note the MINI 1 cover also misspells the module as "PROJECT RELIZATION". Corrected to "Project Realization" above.

---

## 10. Prior Submission: MINI 1

`DOCUMENTATION/NASIBU Y ISAKA 2106307225519.pdf`, 6 chapters, submitted earlier.

**Status: superseded reference, not a binding contract.** User direction, 2026-07-29: MINI 1 has little to do with the system as built, so mine it for what is useful and discard the rest. The system moved a long way after it was written. Do not treat its claims as commitments the final report has to honour, and do not write defensive prose reconciling every difference.

**What is worth taking:**

| From MINI 1 | Use it for |
|---|---|
| Cover page details | Section 9 above, already extracted |
| 2.2 Existing System weaknesses (7 bullets) | 2.4 Existing Systems Review, 5.2 Existing System Analysis |
| 2.3 Research Gap prose | 2.5 Project Research Gap, still accurate |
| 1.1 Background prose on NGO trust and transparency | 1.1 Background, needs APA citations added |
| Questionnaire evidence that primary data was collected | Chapters 3 and 4, see D3-revised |

**What to discard:** the SQLite reference, the Web3 framing, the broken figure numbering, and the 6-chapter structure. The final report describes what exists now.

If a divergence comes up in the viva, the honest answer is that the system evolved through iterative development, which is what the Agile methodology in 3.12 predicts. That is a strength, not a defect.

### MINI 1 structure and how it maps forward

| MINI 1 | Final report destination |
|---|---|
| 1.1 Background Information | 1.1 Background of the Study |
| 1.2 Problem Statement | 1.2 Problem Statement |
| 1.3 Main Objective, 1.4 Specific Objectives | 1.3 Aim, 1.4 Specific Objectives |
| 1.5 Significance, 1.6 Scope | 1.7 Significance, 1.6 Scope |
| 2.2 Existing System | 2.4 Existing Systems Review **and** 5.2 Existing System Analysis |
| 2.3 Research Gap | 2.5 Project Research Gap |
| 2.4 Proposed System | 2.6 Proposed System **and** 5.3 Proposed System |
| 3.1 Methodology | 3.12 Development Methodology |
| 3.2 to 3.5 Data analysis, questionnaire, findings | Chapter 4 in full |
| 4.2 Functional, 4.3 Non-Functional Requirements | 5.4, 5.5 |
| 4.4 Module Functionality, 4.6 Use Case Overview | 5.9 SRS |
| 5.2 Data Modelling (DFD L0/L1, ERD) | 6.3, 6.4.1 |
| 5.3 Process Modelling (activity diagrams) | 6.5.1 |
| 5.4 User Interface Design | 6.7 |
| 6.1 Conclusion, 6.2 Recommendations | 8.3, 8.4 |

MINI 1 has no equivalent of Chapters 5 (feasibility, system requirements), 7 (implementation and testing) or the theoretical/empirical literature review. Those are net-new writing.

MINI 1 figure numbering is broken, with "Figure 0-1" appearing three times and every figure numbered against chapter 0. The final report uses proper per-chapter numbering.

### MINI 1 already contains primary data

MINI 1 section 3.2 states a Google Form questionnaire was distributed to Tanzania Red Cross Society cooperation chat groups and to fellow students, and it reports five chart-based findings on donor trust, donation traceability, transparency expectations, blockchain acceptance and perceived need for better NGO systems.

**This contradicts the assumption behind D3.** Primary data exists. If the Google Form responses are still retrievable, Chapter 4 can carry real respondent demographics, sample size and charts rather than being reframed around documents. What MINI 1 does not report is the sample size, the respondent breakdown or the raw distributions, so the form itself has to be reopened to get them. See D3 in Section 7.

### Divergences, and the settled position on each

| MINI 1 said | Built | Position |
|---|---|---|
| SQLite | PostgreSQL on Neon, Drizzle ORM, 11 migrations | Just describe PostgreSQL. No apology needed. One line in 3.13 or 7.2 if it fits naturally |
| Web3 integration | Ethers.js, backend-only chain access, frontend never touches the chain | Describe as built in 6.2 and 6.11. The key-custody argument is a genuine design strength, use it there |
| Machine Learning Dataset, AI fraud detection | Not implemented | **Settled, `DELIVERABLES_SYNC.md` S1.** ML stays in scope as a planned module. Write 6.9 as design-stage, lead 8.5 Future Work with it, label it "Designed, implementation scheduled" everywhere, and never imply a model runs today |
| Reward tokenization | Impact Points (Stage 8), points not on-chain tokens | Describe accurately as points-based recognition. On-chain token issuance goes in 8.5 |

---

## 11. Working Layout (proposed)

```
DOCUMENTATION/
  REPORT_BLUEPRINT.md          this file
  report/
    00-preliminaries.md
    01-introduction.md
    02-literature-review.md
    03-methodology.md
    04-data-analysis.md
    05-requirements.md
    06-system-design.md
    07-implementation-testing.md
    08-conclusion.md
    references.md
    appendices.md
    assets/
      diagrams/                mermaid sources + rendered png
      screenshots/
    build/
      reference.docx           fonts, spacing, all-black headings
      apa.csl                  APA 7th edition style
      Makefile / build.ps1
```

Rationale: the project is ongoing, so the report is authored as version-controlled Markdown and rebuilt on demand rather than hand-edited in Word. Every code change can be reflected by re-running the build.
