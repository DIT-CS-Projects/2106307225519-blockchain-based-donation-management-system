# MINI 2 Presentation Blueprint

Working reference for building the Changia MINI 2 defence deck.

**Why this file exists:** the source template is a binary `.pptx`. Re-extracting and
re-reading it costs tokens every session. Everything needed from it is captured
here. Read this file, not the `.pptx`.

- Source template: `DOCUMENTATION/MINI 2 Presentation_Guideline_Template.pptx` (29 slides)
- Source report format: `DOCUMENTATION/RECCOMENDED FINAL YEAR PROJECT REPORT FORMAT.pdf`
- Prior submission: `DOCUMENTATION/NASIBU Y ISAKA 2106307225519.pdf` (MINI 1, superseded, see section 11)
- Companion file: `DOCUMENTATION/REPORT_BLUEPRINT.md` covers the written 8-chapter report. This file covers the deck only. Keep the two consistent, do not merge them.
- Output deck (planned): `DOCUMENTATION/Changia_MINI2_Presentation.pptx`
- Last synced with the codebase: **2026-07-29**

---

## 0. Title slide details

Confirmed from the MINI 1 cover page.

| Field | Value |
|---|---|
| Institution | Dar es Salaam Institute of Technology |
| Department | Department of Computer Studies, NTA Level 8 |
| Module | Project Realization |
| Module code | COU 08204 |
| Course | BENG22COE |
| Candidate | Nasibu Y. Isaka |
| Registration number | `2106307225519` (see warning below) |
| Supervisor | Dr Gustaph Sanga |
| Project title | Blockchain-Based NGO Donation Management System |
| Presentation date | **still needed** |

> **Check the registration number before printing.** The MINI 1 filename reads
> `2106307225519` (digit one) while the cover page inside reads `2I06307225519`
> (capital i). One of them is wrong. The deck currently uses the all-digits form.

Still outstanding: presentation date, the time slot allowed (decides how many
`[opt]` slides survive), and whether a DIT logo image file exists anywhere.

---

## 1. What MINI 2 covers

The department report format has **eight** chapters. The MINI 2 presentation
template covers **only Chapters 5, 6 and 7**:

| Chapter | Title | In MINI 2 deck |
|---|---|---|
| 1 | Introduction | no |
| 2 | Literature Review | no |
| 3 | Research Methodology | no |
| 4 | Data Analysis | no |
| **5** | **System Requirement Specification** | **yes** |
| **6** | **System Design** | **yes** |
| **7** | **System Implementation, Testing and Results** | **yes** |
| 8 | Conclusion and Recommendations | no |

Do not add Chapters 1 to 4 or 8 to the main deck. If a panel member asks, an
appendix slide is the right place.

---

## 2. Template design tokens

Extracted from `ppt/theme/theme1.xml` and the slide XML.

| Property | Value |
|---|---|
| Slide size | 12192000 x 6858000 EMU (13.333in x 7.5in, 16:9) |
| Heading font | Cambria (serif) |
| Body font | Calibri (sans) |
| Theme accent1 | `#4472C4` (Office default, unused in practice) |

**Colours actually used on the slides** (frequency order):

| Hex | Role in template |
|---|---|
| `#1B1B1B` | Body text |
| `#D8E4E3` | Card borders, hairlines |
| `#FFFFFF` | Card and slide backgrounds |
| `#0B3D42` | Deep teal, headings and dividers |
| `#028090` | Primary teal, section numbers and accents |
| `#EAF4F3` | Pale teal, tinted panels |
| `#5B6B6D` | Muted grey text |
| `#00A896` | Bright teal, secondary accent |
| `#02C39A` | Mint, tertiary accent |
| `#F4A261` | Amber, used sparingly for callouts |

**This matters:** the template is already a teal system, and Changia's brand is
Harbor Teal `#0f766e`. The deck and the product screenshots will sit together
without clashing. See section 6.

---

## 3. Template slide map (29 slides)

Read this instead of opening the `.pptx`.

| # | Section | Slide content |
|---|---|---|
| 1 | Title | Project title, department, student name/ID, supervisor, date, DIT logo |
| 2 | Roadmap | Three cards: 05 SRS, 06 System Design, 07 Implementation/Testing/Results |
| 3 | Divider | CHAPTER 5, numbered list of its 6 sub-sections |
| 4 | 5.1 | Introduction. Purpose of chapter, problem summary, chapter structure. Side callout "PRESENTING 5.1" |
| 5 | 5.3 | Proposed System. Callout "MAP TO 5.2" |
| 6 | 5.4 | Functional Requirements. Callout "TRACEABILITY", number as FR-01, FR-02 |
| 7 | 5.5 | Non-Functional Requirements. 7 tiles: Security, Performance, Reliability, Maintainability, Availability, Scalability, Usability |
| 8 | 5.7 | System Requirements. 4 columns: Hardware, Software, Network, Model and Algorithms |
| 9 | 5.8 | Feasibility Study. 5 columns: Technical, Economic, Operational, Legal, Schedule |
| 10 | 5.9 | SRS use-case diagram. Native shapes: system boundary, 6 ovals, 3 actors |
| 11 | Divider | CHAPTER 6, 6 sub-sections |
| 12 | 6.1 | Introduction. Callout "FRAMING": Ch5 = WHAT, Ch6 = HOW |
| 13 | 6.2 | System Architecture. 3 stacked layer bars: Presentation, Application, Data |
| 14 | 6.3 | Data Modeling. Context diagram plus DFD levels. Callout "ORDER OF PRESENTATION" |
| 15 | 6.4 | Database Design. ERD, schema, data dictionary, table structures. Callout "TIP" |
| 16 | 6.5 | UML Models. Numbered 01 to 08 grid of diagram types |
| 17 | 6.7 | UI Design. 4 cards: Login, Dashboard, Forms, Reports |
| 18 | 6.8 to 6.9 | Hardware / ML / Algorithms. Callout "NOT APPLICABLE?" says omit if irrelevant |
| 19 | 6.10 | Flowchart. Native shapes: Start, input, decision, process, output, End |
| 20 | 6.11 | Security Design. 5 bullets. Callout "TRACEABILITY" back to 5.5 |
| 21 | Divider | CHAPTER 7, 5 sub-sections |
| 22 | 7.1 | Introduction. Callout "PACING": keep brief, audience wants the system |
| 23 | 7.2 to 7.3 | Development Environment and Software Tools. 2 columns |
| 24 | 7.4 | Implementation of Modules. Callout "TRACEABILITY" back to FR-xx |
| 25 | 7.5 | Testing Strategy. 4 tiles: Unit, Integration, System, UAT |
| 26 | 7.6 | Test Cases. 5-column table: Test ID, Description, Input, Expected Result, Status |
| 27 | 7.7 to 7.8 | Results and Discussion. Callout "ACADEMIC TIP": be honest about limitations |
| 28 | 7.9 | System Screenshots. 4 placeholder frames |
| 29 | Closing | Thank You, Questions and Discussion, presentation tip footer |

**Recurring template devices to preserve:**
- Section number badge (large teal `5.4`) top-left of every content slide.
- Right-hand callout box with an ALL-CAPS label (PRESENTING, TRACEABILITY, TIP, PACING).
- Chapter footer strip on every content slide (`Chapter Five · System Requirement Specification`).
- Chapter dividers use an oversized ghosted numeral.

---

## 4. Gaps in the template

Found by diffing the 29 slides against the report format. Fix these in our deck.

| Gap | Detail | Fix |
|---|---|---|
| **5.2 has no slide** | Deck jumps 5.1 to 5.3. Slide 3 folds "Existing System Analysis" into item 1, and slide 5 tells you to map back to a 5.2 that was never presented | Add a dedicated **5.2 Existing System Analysis** slide before Proposed System |
| **5.6 has no slide** | Slide 3 lists "User & System Requirements" but only 5.7 System Requirements exists | Add **5.6 User Requirements** (per-role: donor, fundraiser, admin) |
| **ERD slide missing** | Slide 15 says "see diagram on next slide". The next slide is UML, not an ERD | Add a real **ERD diagram** slide after 6.4 |
| **UML diagrams are a menu, not diagrams** | Slide 16 lists 8 diagram types on one slide with none drawn | Add actual diagram slides: use case, class, sequence, activity, deployment |
| **DFD levels not drawn** | Slide 14 describes Context and Level 1 without showing either | Add Context diagram and DFD Level 1 slides |
| **No demo slide** | Nothing prompts a live demonstration | Add a **live demo + QR** slide. We are deployed, this is our strongest asset |
| **No limitations slide** | 7.8 mentions limitations inside a shared slide | Give **limitations and future work** its own slide |
| **No appendix** | Panel questions have nowhere to land | Add a small hidden appendix after Thank You |
| Slide 18 is half N/A | Hardware/IoT does not apply. **ML does**, as a designed future module | Drop the hardware sub-section. Keep **6.9 ML and Dataset Design** (design-stage) and **6.9.1 Algorithms**. See `DELIVERABLES_SYNC.md` S1 |

---

## 5. Changia deck plan

Target: **42 slides**, ~20 minutes. Slides marked `[opt]` are cut first if time is tight.
Slides marked `[apx]` sit after Thank You and are not presented.

### Front (3)
| # | Slide | Content |
|---|---|---|
| 1 | Title | Blockchain-Based NGO Donation Management System. Changia. Names, IDs, supervisor, DIT logo, date |
| 2 | Roadmap | The three chapters, matching template slide 2 |
| 3 | The system in one slide `[opt]` | One sentence, the live URL, the Sepolia contract address, one hero screenshot |

### Chapter 5, System Requirement Specification (11)
| # | Slide | Changia content |
|---|---|---|
| 4 | Divider | Chapter 5, 7 sub-sections |
| 5 | 5.1 Introduction | Purpose of the chapter. Trust gap in Tanzanian charitable giving |
| 6 | **5.2 Existing System Analysis** (new) | Manual/spreadsheet NGO records, M-Pesa/Tigo Pesa with no public audit trail, generic crowdfunding platforms. Weaknesses: no immutability, no donor-verifiable receipt, no separation of duties on payouts |
| 7 | 5.3 Proposed System | Changia. Each 5.2 weakness mapped to a fix. Familiar mobile money in front, blockchain proof behind. Scope in/out |
| 8 | 5.4 Functional Requirements (1/2) | FR-01 to FR-12, grouped by actor: Donor, Fundraiser |
| 9 | 5.4 Functional Requirements (2/2) | FR-13 to FR-24: Administrator, System. Traceability note pointing to 7.6 |
| 10 | 5.5 Non-Functional Requirements | 7 template tiles with **measured** targets, not aspirations. Source from `docs/SECURITY.md` and real response times |
| 11 | **5.6 User Requirements** (new) | Three role columns: Donor, Fundraiser, Administrator. Pull from `docs/PROJECT_OVERVIEW.md` |
| 12 | 5.7 System Requirements | Five columns: Hardware / Software / Network / **Blockchain** (Sepolia, Hardhat, funded wallet, RPC) / **Model and Algorithms** (planned fraud-detection model, labelled as scheduled) |
| 13 | 5.8 Feasibility Study | 5 columns. Economic is strong: free tiers plus Sepolia test ETH, near-zero running cost |
| 14 | 5.9 Use Case Diagram | Real diagram. 4 actors: Donor, Fundraiser, Administrator, Payment Gateway / Blockchain as external systems |

### Chapter 6, System Design (17)
| # | Slide | Changia content |
|---|---|---|
| 15 | Divider | Chapter 6 |
| 16 | 6.1 Introduction | Ch5 = WHAT, Ch6 = HOW. Notations used: DFD, ERD, UML |
| 17 | 6.2 System Architecture | Layered: React/Vite client, Express API (routes to controllers to services to repositories), PostgreSQL/Neon, plus a side rail for Sepolia and the payment provider. Source: `docs/SYSTEM_ARCHITECTURE.md` |
| 18 | 6.2b Blockchain Design `[opt]` | Where proof lives vs where data lives. `TransparencyRegistry.sol`, the SHA-256 proof payload (Decision 010), why no personal data goes on-chain |
| 19 | 6.3 Context Diagram | Level 0. Changia as one process with Donor, Fundraiser, Admin, AzamPay, Ethereum |
| 20 | 6.3b DFD Level 1 | Major processes: Authenticate, Manage Campaign, Process Donation, Record Proof, Disburse Funds, Report |
| 21 | 6.4 Database Design | 14 tables, 11 migrations, Drizzle ORM on Neon PostgreSQL. Immutability rules on `donations` |
| 22 | 6.4b ERD | Real ERD. Core entities only: users, campaigns, donations, payment_transactions, blockchain_records, beneficiaries, disbursements. Full 14-table version goes in the appendix |
| 23 | 6.4c Data Dictionary `[opt]` | One table, the `donations` table field by field |
| 24 | 6.5 Class Diagram | Backend service layer, or the Drizzle entity model |
| 25 | 6.5b Sequence Diagram | **The donation flow.** Donor → Client → API → Payment Provider → callback → DB transaction → blockchain service → Sepolia. This is the money slide of Chapter 6 |
| 26 | 6.5c Activity Diagram | Disbursement dual approval. Threshold check, self-approval block, second admin, payout, proof |
| 27 | 6.5d Deployment Diagram | Vercel, Render, Neon, Sepolia, browser. Real hosts and real URLs |
| 28 | 6.7 User Interface Design | Design system in brief: Harbor Teal, Source Serif 4 + Inter, light/dark. 4 screens: auth, campaign detail, dashboard, verify |
| 29 | 6.9 ML and Dataset Design | **Design only, clearly labelled "Designed, implementation scheduled".** Fraud-detection intent, dataset source (the platform's own donation and disbursement history), candidate features (amount anomaly, velocity, new-beneficiary risk, campaign age), model family, train/test split. Zero claim that it runs today. `DELIVERABLES_SYNC.md` S1 |
| 29b | 6.9.1 + 6.10 Algorithms and Flowchart | Proof-hash algorithm as short pseudocode, plus the donation flowchart |
| 30 | 6.11 Security Design | JWT access + rotating httpOnly refresh, bcrypt, RBAC, account lockout, rate limiting, parameterised queries, audit log, separation of duties. Traceability back to 5.5 Security |

### Chapter 7, Implementation, Testing and Results (9)
| # | Slide | Changia content |
|---|---|---|
| 31 | Divider | Chapter 7 |
| 32 | 7.1 Introduction | Brief. Built in stages, currently deployed and publicly reachable |
| 33 | 7.2 + 7.3 Environment and Tools | Windows, VS Code, Git/GitHub with main and develop, Node, TypeScript, Vite, Hardhat, Drizzle Kit, ESLint |
| 34 | 7.4 Implementation of Modules | 8 modules mapped to FR ranges: Auth, Campaigns, Donations/Payments, Blockchain, Admin, Fundraisers, Rewards, Reporting. Note 1 or 2 hard problems solved (idempotent callbacks, never awaiting the chain write) |
| 35 | 7.5 Testing Strategy | 4 template tiles filled with what we actually ran: Hardhat contract tests, automated API E2E, real-browser checks, manual UAT |
| 36 | 7.6 Test Cases | Template's 5-column table, **real IDs and real results** from the E2E runs |
| 37 | 7.7 + 7.8 Results and Discussion | Real pass counts (see section 7 below). Honest note on the known non-passes |
| 38 | 7.9 System Screenshots | 4 to 6 real screenshots, one user journey end to end |
| 39 | **Live Demo** (new) | QR to `changia-hazel.vercel.app` (`deployment/changia-qr.png` already exists), Etherscan link for a real transaction. Invite the panel to scan and verify a receipt themselves |

### Close (2 + appendix)
| # | Slide | Content |
|---|---|---|
| 40 | Limitations and Next Steps (new) | Honest list. Sepolia is a testnet not mainnet, AzamPay credentials pending, Render free tier cold starts, uploads on ephemeral disk |
| 41 | Thank You | Questions and Discussion |
| A1+ | Appendix `[apx]` | Full 14-table ERD, full FR list, full test log, Decision Log highlights, cost breakdown |

---

## 6. Visual direction

Keep the template's **structure and its teaching devices**. Raise the **craft**.

**Recolour to Changia.** Map template teal to brand teal so slides and product
screenshots read as one system:

| Template | Changia | Use |
|---|---|---|
| `#0B3D42` | `#134e4a` | Divider backgrounds, headings |
| `#028090` | `#0f766e` Harbor Teal | Section numbers, primary accent, rules |
| `#00A896` | `#14b8a6` | Secondary accent, diagram fills |
| `#02C39A` | `#5eead4` | Tertiary, chart series |
| `#EAF4F3` | `#ccfbf1` Harbor Teal Tint | Tinted panels, callout boxes |
| `#F4A261` | `#ff6b6b` Signal Coral | Rare emphasis only, never primary |
| `#1B1B1B` | `#0f172a` Ink Slate | Body text |
| `#5B6B6D` | `#64748b` Slate Mist | Muted text |
| `#D8E4E3` | `#e2e8f0` | Hairlines, card borders |
| `#FFFFFF` | `#ffffff` | Surfaces |

Source of truth: `docs/DESIGN.md` and `docs/DESIGN_SYSTEM.md`.

**Typography.** Brand fonts are Source Serif 4 (display) and Inter (body). A
`.pptx` does not carry fonts, so a machine without them substitutes and the
layout shifts.

- Build with **Georgia** (display) and **Segoe UI** (body). Both ship with Windows and Office, both are close in feel to the brand pair, and neither will substitute on the presentation PC.
- Export a **PDF alongside the `.pptx`** as the presentation-safe copy.

**Craft upgrades over the template:**
- Full-bleed teal chapter dividers with a ghosted numeral, rather than the template's lighter treatment.
- Consistent 12-column grid, generous margins, one idea per slide.
- Native PowerPoint shapes for every diagram, never bitmap screenshots of diagrams. They stay crisp on a projector and remain editable.
- Screenshots in rounded device frames with a soft shadow, on a tinted panel.
- A thin progress rail on the footer showing position within the chapter.
- Real numbers everywhere. No lorem, no placeholder, no invented metric.

---

## 7. Verified project facts (for slide content)

Keep this table current. It is the fact source for the deck.

| Fact | Value |
|---|---|
| Product name | Changia (formerly Tuma) |
| Live frontend | `https://changia-hazel.vercel.app` (Vercel) |
| Live backend | `https://changia-api.onrender.com` (Render) |
| Database | Neon PostgreSQL |
| Contract | `TransparencyRegistry.sol` at `0x353b6cdaD14774412B5C7612F0C0D153378F213A` on Sepolia |
| Backend wallet | `0x45338f0ba58b3b114d3545C45055f5b35d4bf716` |
| QR asset | `deployment/changia-qr.png` |
| Roles | Donor → Fundraiser → Administrator |
| Tables | 14 (13 in `database/DATABASE_SCHEMA.md` plus `reward_events`) |
| Migrations | 11, in `server/src/database/migrations/` |
| API route groups | 15: auth, campaign, donation, payment, beneficiary, disbursement, admin, report, notification, reward, stats, verify, contact, health, index |
| Client pages | 21 top-level plus an `admin/` group |
| Contract tests | 4 Hardhat tests passing |

**E2E verification results** (from `docs/CURRENT_PROGRESS.md`, use these in 7.6 and 7.7):

| Stage | Result |
|---|---|
| Stage 3 Authentication | 18/18 browser checks |
| Stage 4 Donations | 19/19 API checks |
| Stage 5 Blockchain | 14/14 API + 10/10 browser + 4/4 contract |
| Stage 6 Administrator | 46/47 (one test-timing artifact, not a defect) |
| Stage 7 Fundraisers | 40/40 API checks |
| Post-Stage 7 | 52/53 (one transient Neon cold-start timeout) |

Be honest about the two non-passes on the Results slide. The template's own
academic tip says examiners reward critical reflection.

**Key decisions worth naming out loud:** 009 AzamPay as the gateway, 010 minimal
on-chain proof payload, 015 PostgreSQL as primary store, 020 community
fundraisers, 022 Impact Points. Full text in `docs/DECISION_LOG.md` (26 decisions).

---

## 8. Build toolchain

**Status: BUILT.** 42 slides, generated and visually reviewed 2026-07-29.

| Artefact | Path |
|---|---|
| Deck | `DOCUMENTATION/Changia_MINI2_Presentation.pptx` |
| PDF (presentation-safe copy) | `DOCUMENTATION/Changia_MINI2_Presentation.pdf` |
| Design system and primitives | `DOCUMENTATION/build/theme.py` |
| All slide copy | `DOCUMENTATION/build/content.py` |
| Slide composition | `DOCUMENTATION/build/build.py` |
| Screenshot drop folder | `DOCUMENTATION/assets/screens/` |

### Rebuild

```bash
python DOCUMENTATION/build/build.py
```

Takes about a second and overwrites the `.pptx` completely.

### Re-render for review, and re-export the PDF

PowerPoint is installed, so it can be driven over COM. This is how the deck gets
proofed: rendering every slide to PNG is the only way to catch text overflowing a
card, which a geometry check cannot see.

```powershell
$out = "<scratch>\render"
$app = New-Object -ComObject PowerPoint.Application
$pres = $app.Presentations.Open("d:\ngo-donation-system1\DOCUMENTATION\Changia_MINI2_Presentation.pptx", $true, $false, $false)
$pres.SaveCopyAs("d:\ngo-donation-system1\DOCUMENTATION\Changia_MINI2_Presentation.pdf", 32)
$pres.Export($out, "png", 1400, 788)
$pres.Close(); $app.Quit()
```

### Toolchain notes

| Need | Tool | Status |
|---|---|---|
| Generate the `.pptx` | Python 3.14 + `python-pptx` 1.0.2 | installed |
| Image handling | `Pillow` 12.3.0 | installed |
| Diagrams | Native `python-pptx` shapes | no extra install |
| Render and PDF | PowerPoint 16.0 over COM | available, no LibreOffice needed |
| QR code | `deployment/changia-qr.png` | embedded on the demo slide |

### Design decisions made during the build

- **Georgia + Segoe UI, not Source Serif 4 + Inter.** A `.pptx` carries no fonts.
  Both substitutes ship with Windows, so the layout cannot shift on the
  presentation machine.
- **Section numbers are set in Segoe UI, not Georgia.** Georgia uses old-style
  figures, which wobble badly on strings like `6.5.1`. The serif title now has
  lining figures to contrast against.
- **Dark slides use a real gradient**, not stacked rectangles. Hard vertical
  bands read as a mistake rather than as a design.
- **Keep section markers short.** The title starts 1.30in from the margin, so a
  marker wider than that collides with it. `6.9.1 · 6.10` did; `6.10` does not.
- **Diagrams are native shapes**, so they stay crisp on a projector and the
  examiner can edit them.

---

## 9. Change protocol

The project is still moving, so the deck must be cheap to regenerate.

1. **Never hand-edit the generated `.pptx`.** Edit the build script or the
   content file, then regenerate. Hand edits are lost on the next build.
2. **Content lives apart from layout.** Slide text sits in a content module the
   build script reads, so a copy change never risks the layout.
3. **When the system changes**, update section 7 of this file first, then rebuild.
4. **Screenshots are the fastest thing to go stale.** Recapture after any UI pass.
5. Track in git. The `.pptx` is a binary, so the meaningful diff is in the build
   script and this file.

---

## 11. Carried forward from MINI 1

MINI 1 (`NASIBU Y ISAKA 2106307225519.pdf`) is superseded by the current build,
but the panel has it on file. Two things follow: reuse what still holds, and be
ready to explain what changed.

### 11a. Still valid, quote it as-is

**Main objective.** To design and develop a blockchain-based NGO Donation
Management System that improves transparency, accountability, and secure
management of donations through blockchain technology and local mobile money
integration.

**Five specific objectives** (use these verbatim on a slide, then show which
module delivers each, which is exactly the traceability the template asks for):

1. Design a secure system for managing NGO fundraising campaigns and donor information.
2. Develop a transparent donation process that records donation and fund disbursement transactions on the blockchain.
3. Integrate local mobile money payment services so donors contribute using familiar payment methods.
4. Provide real-time monitoring of donation progress, fund utilization, and beneficiary disbursement through interactive dashboards and notifications.
5. Develop an audit and reporting module that generates transaction logs and compliance reports.

**Objective to module mapping** (all five are built, which is a strong slide):

| Objective | Delivered by | Evidence |
|---|---|---|
| 1 | Auth + Campaigns modules, RBAC, soft delete | Stage 3, Stage 6 |
| 2 | Donations + Blockchain modules, `TransparencyRegistry.sol` | Stage 4, Stage 5, live on Sepolia |
| 3 | Payment provider abstraction, AzamPay adapter | Stage 4, Decision 009 |
| 4 | Dashboards (donor, fundraiser, admin), notifications | Stage 6, Stage 7 |
| 5 | Reports module (CSV/Excel/PDF), audit log | Stage 6 |

**Problem statement, significance and stakeholder analysis** all still hold. The
stakeholder list (NGOs, donors, beneficiaries, researchers, regulators) is
reusable for 5.6 User Requirements.

### 11b. Changed since MINI 1, prepare an answer

| MINI 1 said | Now | How to present it |
|---|---|---|
| NGO administrators create campaigns | Any verified person can be a **fundraiser**, admins are neutral operators | Decision 020. Present as a deliberate scope improvement: it widens reach while separation of duties still stops a fundraiser from paying themselves |
| "reward tokens" based on contributions | **Impact Points**, an append-only ledger, no token | Decision 022. Say it plainly: tokens would imply a cryptocurrency, which the scope explicitly excluded. Points deliver the same engagement without that contradiction |
| Diagram 5.2.5 "Machine Learning Dataset", plus "framework for future AI-based fraud detection" | **Designed, implementation scheduled.** Planned module of the system, not yet built | Present the *design* in 6.9, which is what a design chapter is for, and lead the Future Work slide with it. Never imply a working model exists. See `DELIVERABLES_SYNC.md` S1 |
| 6-chapter structure (Intro, Lit Review, Data Analysis, SRS, System Design, Conclusion) | Department's 8-chapter format | MINI 1's Ch4 SRS is now Ch5, its Ch5 System Design is now Ch6. Renumber, do not re-scope |
| Design-stage mockups only | Deployed and publicly reachable | The single biggest upgrade. Lead with it |

### 11c. Diagrams to rebuild

MINI 1 already contained these, all now outdated. Redraw as native PowerPoint
shapes against the current system:

| MINI 1 figure | Status |
|---|---|
| Use Case Diagram | Redraw. Add the Fundraiser actor, which did not exist |
| DFD Level 0 and Level 1 | Redraw. Processes changed with fundraisers and rewards |
| Entity Relationship Diagram | Redraw. 14 tables now, not the MINI 1 set |
| Blockchain Data Model | Redraw. `blockchain_records` is polymorphic now (donation or disbursement) |
| Machine Learning Dataset | **Keep and redraw** as a design-stage diagram. Rebase the dataset on the real schema now that `donations`, `disbursements` and `audit_logs` exist and can actually feed it |
| 3 Activity Diagrams (donor, administrator, disbursement approval) | Keep the disbursement one, it is the strongest. Update for the cumulative self-serve cap |
| 5 UI screenshots | Recapture from the live site. The entire design system changed |

---

## 10. Open questions for the presenter

Needed before the title slide can be finished:

- Full student name(s) and registration number(s)
- Supervisor name
- Department and programme exact wording
- Presentation date
- Whether the DIT logo file exists anywhere, or needs sourcing
- Time slot allowed, which sets how many `[opt]` slides survive
