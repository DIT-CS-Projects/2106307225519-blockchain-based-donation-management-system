# CURRENT PROJECT STATUS

## Overview

This document records the current implementation status of the project.

It serves as a reference for developers and AI coding agents.

---

# Completed

Project Planning

✓ Problem Definition

✓ Requirements Analysis

✓ Literature Review

✓ System Design

✓ Architecture Design

✓ Technology Selection

---

Documentation

✓ Project Manifesto

✓ Product Requirements

✓ Business Rules

✓ Architecture Documentation

✓ Design Documentation

✓ Development Standards

✓ Documentation Reconciliation (all contradictions resolved — see Decisions 009–014)

---

Repository

✓ Git Repository

✓ GitHub Remote

✓ Branch Strategy (main / develop)

✓ .gitignore

---

# Completed — Stage 1 Foundation

✓ React + Vite + TypeScript client (builds and lints clean)

✓ Tailwind v4 + Design System tokens (light/dark)

✓ shadcn/ui configured (Button primitive, cn util)

✓ Client structure: services (Axios), context (theme), hooks, router, constants, utils

✓ Express + TypeScript server, layered (routes → controllers → services → repositories)

✓ Server middleware: Helmet, CORS, rate limiting, central error handler; health endpoint live

✓ PostgreSQL + Drizzle ORM wired (boots without DB until Neon is connected)

✓ Hardhat + Ethers + TransparencyRegistry.sol (compiles, 4 tests passing)

✓ ESLint across client and server; .env.example for server and contracts

---

# Completed — Stage 2 Public Website (in progress)

✓ Foundation fixes from impeccable audit (self-hosted @fontsource variable fonts, pre-paint theme script kills dark-mode FOUC, safeStorage guard on all localStorage access, reduced-motion guard on smooth scroll, Button transition scoped to colors)

✓ Public layout shell: Navbar (transparent → solid on scroll, active links in Harbor Teal, theme toggle), full-screen mobile nav sheet (Radix Dialog), Footer, PublicLayout with skip-to-content

✓ Routes wired: / /campaigns /about /contact (+ /login /register /privacy /terms placeholders, 404 catch-all)

✓ Landing page (impeccable craft): hero with example verification receipt, featured campaigns (loading/empty/error states against GET /campaigns), how-verification-works sequence, stats section (real data only — hidden pre-launch), why-verification with verified Dar es Salaam harbor photo, closing CTA

✓ Shared primitives: ProgressBar, Skeleton, Reveal (CSS scroll-driven), CampaignCard, useFetch; campaigns + stats services on the Axios layer

✓ Impeccable audit after landing page: 18/20 (baseline 16/20 on 2026-07-17)

---

✓ Campaigns slice (first full-stack piece): campaigns table in Postgres (Drizzle, Neon), GET /api/campaigns (search/category/sort/pagination) and GET /api/campaigns/:id, GET /api/stats now backed by real data; client campaigns list (search, category chips, sort, pagination) and campaign details page (funding progress, donation widget disabled until Stage 4 payments, verification panel, related campaigns); landing page's featured campaigns and stats sections now render live data instead of the error state; verified end-to-end against a seeded Neon database (7 campaigns)

✓ About page: the verification story (mission, the trust problem, four-step "how a donation works" ladder, trust commitments, plain-language "where the proof lives" explainer)

✓ Contact page: validated message form (react-hook-form + zod, full states) backed by a real POST /api/contact endpoint; email delivery deferred to Stage 3 (message logged and acknowledged)

✓ Platform renamed Tuma → Changia across app, docs, and package metadata; em dashes removed from user-facing copy

---

# Completed — Stage 2 Public Website

The public website is complete: landing, campaigns list + details, about, and contact are all built, styled to the Changia (Glass Ledger) identity, responsive, accessible, and verified end-to-end against a live database.

---

# Completed — Stage 3 Authentication

Database: users (role enum, soft delete, lockout columns), sessions (revocable refresh tokens, remember-me persistence), password_resets (single-use hashed tokens) — three Drizzle migrations, applied to Neon.

Backend: full auth surface per api/authentication.md, layered routes → controllers → services → repositories — register, login (with account lockout after 5 failed attempts and remember-me), logout, logout-all-devices, refresh (rotating), GET /me, PUT /profile, PUT /change-password, POST /forgot-password (always 200, never leaks account existence), POST /reset-password (single-use, 1-hour expiry). bcrypt hashing, short-lived JWT access token, httpOnly rotating refresh cookie, requireAuth/requireRole RBAC middleware, rate limiting on auth endpoints. Public registration creates donors only; the initial administrator is provisioned via an env-based seed script (`db:seed:admin`).

Frontend: AuthContext/useAuth (mirrors the ThemeProvider pattern, single-flight session bootstrap on load), Axios 401→refresh→retry interceptor, real Login/Register/Forgot-Password/Reset-Password pages per pages/authentication-pages.md, AccountPage (profile, change password, per-session and all-devices logout), role-gated AdminDashboardPage placeholder, ProtectedRoute wrapper, Navbar/MobileNav wired to real auth state.

Verified end-to-end in a real browser against the live Neon database: register → protected route → reload persistence → logout → RBAC block → login error states → admin login, 18/18 automated browser checks passing plus manual coverage of forgot/reset password states.

---

# Completed — Stage 4 Donations

Database: donations (immutable, never deleted), payment_transactions (one row per checkout attempt, unique reference, capability token, raw provider payloads), blockchain_records (authoritative proof table, one row per donation, opens 'pending' for Stage 5). One Drizzle migration, applied to Neon.

Payments: a PaymentProvider abstraction (docs/PAYMENT_ARCHITECTURE.md) with a self-contained mock provider selected by PAYMENT_PROVIDER, so the full donate flow runs locally with no external credentials or public webhook. Real AzamPay drops in as another adapter behind the same interface (Decision 009). POST /payments/create-session (auth, validates a donatable campaign + minimum amount), POST /payments/callback (public, provider-verified, idempotent), GET /payments/status/:reference (owner-scoped). Finalizing a verified payment is one atomic transaction: create donation, open pending blockchain proof, link and close the payment, and credit the campaign. Duplicate callbacks resolve to the same donation with no double credit.

Donations: GET /donations/history, /summary (totals + monthly chart data), /:id, /:id/verify, and /:id/receipt (real PDF via pdfkit) all owner-scoped; /statistics is admin-only. Login is required to donate (business rule: every donation belongs to one donor).

Frontend: the DonationWidget is live on the campaign details page (amount presets + custom, payment method and provider selectors). Anyone can pick an amount; a logged-out donor is routed to sign in and returned to the campaign with the amount preserved. Authenticated donors get a checkout session and land on the sandbox checkout page, then a donation success + detail view with a downloadable receipt and a pending verification badge. A donations history page (summary stat cards + responsive table) is wired into the navbar for donors. Blockchain proof status shows 'pending' until Stage 5 records it on-chain.

Verified end-to-end against the live Neon database: 19/19 automated API checks covering register → create session → status → provider callback → donation with pending proof → history → summary → real PDF receipt → verify → idempotent duplicate callback → exact campaign crediting → auth gate → amount and provider validation → cancelled-payment (no donation) → admin-only RBAC → cross-account isolation. Client builds and lints clean; both dev servers boot and the client proxies the API. Test data created during verification was reverted, restoring seeded campaign totals.

Next up: Stage 5 — Blockchain (record donation proofs on Sepolia, fill blockchain_records, verification + explorer).

---

# Completed — Stage 5 Blockchain

Contract: TransparencyRegistry.sol from Stage 1 already matched the spec exactly (registerDonation, verifyDonation, getDonation, owner-only writes, duplicate rejection, events) — no changes needed. Deployed to a persistent local Hardhat node for development, matching Decision 010 (Sepolia stays a later, real-network upgrade behind the same env-selected config, same pattern as AzamPay in Stage 4).

Backend: a blockchain service (server/src/services/blockchain.service.ts) wraps ethers.js — a lazily-built provider/wallet/contract client that degrades gracefully when unconfigured, a deterministic SHA-256 proof hash (Decision 010: donation ID, campaign ID, amount, receipt number, payment reference, timestamp), one-transaction-per-donation recording, and a live no-gas contract read for reconciliation. Proof recording fires immediately after a donation is created but is never awaited by the payment callback (flows/payment-flow.md: blockchain failure must never lose donation data); on success it confirms the donation's blockchain_records row with the real tx hash, block number, and network. The donor GET /donations/:id/verify now does a live chain reconciliation when a proof is still pending, self-healing if a background write crashed. A new public GET /api/verify/:receiptNumber (no auth) backs the transparency "Explorer": looks up a donation by receipt number and returns campaign, amount, date, and tx hash — never donor name, email, or payment reference.

Frontend: a public /verify page (plus /verify/:receiptNumber deep link) with a receipt lookup form, pending/verified/not-found states, and a network-aware block explorer link (Sepolia links out; local dev shows the raw hash since there's no public explorer for it), linked from the footer. The donation detail page's transaction link and the donor's own verify flow now reflect real on-chain state instead of a permanent placeholder.

Verified end-to-end against a real local Hardhat chain and live Neon: 14/14 automated API checks (including cross-checking the Hardhat node's own log for the exact transaction hash returned by the API) plus 10/10 real-browser checks on the /verify page (deep link auto-verification, no PII leak, correct not-found state, footer link). Contract's own 4 Hardhat tests still pass. Client and server build and lint clean. Test data created during verification was reverted.

Note: the local Hardhat node holds its chain in memory and resets on restart — redeploy (contracts/: `npm run node`, then `npm run deploy:local`) and update CONTRACT_ADDRESS in server/.env if it's ever restarted.

Next up: Stage 6 — Administrator (dashboard, campaign management, beneficiaries, disbursements with dual approval, reports, audit logs). Disbursement proofs reuse the same contract (registerDisbursement/verifyDisbursement already implemented) once disbursements themselves are built.

---

# Completed — Stage 6 Administrator

Database: beneficiaries, disbursements, disbursement_approvals, notifications, audit_logs tables; blockchain_records made polymorphic (donation OR disbursement, mirroring the contract's own RecordType) so disbursement proofs reuse the same table; users gained a status column (active/suspended/deactivated).

Campaign management: admin CRUD (create as draft, update, archive, soft delete) with Multer local-disk image upload (validated type/size, random filenames — never the client-supplied name), all audit-logged. Beneficiaries: full CRUD, admin-only verification toggle, donor-facing reads show only verified beneficiaries (now live on the public campaign details page), contact info never exposed publicly.

Disbursements: available balance = raised − completed disbursements; below the dual-approval threshold a payout is auto-approved and paid instantly (mock provider, real AzamPay adapter drops in later); at/above threshold it waits for a second administrator (the initiator can never approve their own) and rejection requires a reason. Every completed disbursement gets a blockchain proof via the same TransparencyRegistry contract used for donations (registerDisbursement, already built in Stage 1/5).

Users: admin list/detail/status endpoints; suspending or deactivating a user revokes every session and blocks future login; an admin cannot suspend themselves.

Dashboard: real aggregation (total donations/revenue, active campaigns, beneficiaries, registered users, confirmed chain transactions, recent donations, active campaign overview, donation-trend and payment-method charts via Recharts) behind a proper admin console shell (sidebar, mobile drawer, notification bell).

Audit log: every admin write action (campaign/beneficiary/disbursement/user/notification) and every login attempt is recorded; read-only, searchable, filterable admin viewer.

Notifications: in-app (DB-backed, bell + toast, 30s poll) for donation success, campaign closed/goal-achieved, beneficiary updates, password changed, disbursement completed/failed, and admin broadcasts; selected events also send email through an EmailProvider abstraction (console-log mock now, real Nodemailer/SMTP adapter behind the same interface once credentials exist — same pattern as the Stage 4 payment provider). The Stage 3 forgot-password flow, previously just logged, now actually sends through this provider.

Reports: donation/campaign/beneficiary/disbursement/blockchain aggregation, each exportable as real CSV, Excel (exceljs), or PDF (pdfkit) through one shared export utility. The Stage 2 landing-page stats endpoint's `peopleHelped`/`verifiedDonations` seam (left at 0 pending "Stages 4-6") is now wired to real data.

Verified end-to-end against live Neon and the local Hardhat chain: 46/47 automated API checks (campaign draft/publish visibility and RBAC, beneficiary verification gating, dual-approval disbursement lifecycle including self-approval prevention and insufficient-balance rejection, user suspend/reactivate/login-block, real dashboard numbers, audit trail, donor notification + broadcast delivery, all 5 reports with byte-verified CSV/xlsx/PDF exports, image upload + static serving, public stats). The one non-pass was a test-timing artifact (asserting an immediate response status that had already async-advanced to the next state), not a functional defect. Found and fixed one real bug along the way: `notify()` could crash the server via an unhandled rejection if a notification insert failed (e.g. a migration that hadn't applied yet); it now catches and logs internally, matching the fire-and-forget pattern already used elsewhere. Server and client build, lint, and typecheck clean.

Next up: Stage 7 — Community Fundraisers (Decision 020).

---

# Completed — Stage 7 Community Fundraisers (Decision 020)

The platform opened beyond a single admin-run NGO: any verified person can raise funds, with administrators acting as neutral operators. Separation of duties is preserved so no one both benefits from a payout and releases it beyond a self-serve allowance.

Database: `user_role` gained `fundraiser`; campaigns gained `owner_id`, `rejection_reason`, and the review statuses `pending_review`/`rejected`; disbursements gained `self_released`; new `fundraiser_applications` table; five new notification types. Two additive Drizzle migrations, applied to Neon.

Roles and onboarding: three roles — donor → fundraiser → admin. Two ways to become a fundraiser: register directly as one at sign-up (immediate role, identity captured as an auto-approved application — Decision 021), or upgrade an existing donor account via an application an administrator approves (Decision 020). Admins can promote a user to administrator; admin is never self-assignable. `verifyAccessToken` now derives its allowed roles from the `user_role` enum (a hardcoded donor/admin allowlist had to be widened — caught by the E2E when fundraiser tokens 401'd).

Campaign ownership and review gate: every campaign has an owner; fundraisers manage only their own, admins manage all. Fundraiser campaigns start Pending Review and go live only after an admin approves (or are rejected with a reason). Public listings still show active/completed only.

Beneficiaries: a fundraiser adds beneficiaries to their own campaigns; verification stays admin-only, which is the control that stops a fundraiser paying out to a fabricated payee.

Disbursement threshold self-serve with cumulative cap: a fundraiser initiates payouts from their own campaign to verified beneficiaries. The 1,000,000 TZS dual-approval threshold applies to the campaign's cumulative self-released total (not a single payout): payouts release instantly while under the cap; the one that would cross it, and every one after, needs an administrator's approval (never the initiator). Admin-initiated payouts keep the per-payout rule. Admin-approved payouts do not count toward the cap.

Frontend: "Become a fundraiser" on the account page (apply + pending/rejected/approved states, with a session refresh to activate the new role without a hard re-login); a fundraiser dashboard (own campaigns with status), create/edit campaign, and a per-campaign manage page (submit for review, add beneficiaries, view balance + self-serve remaining, release payouts). Admin console gained a Reviews page (fundraiser applications + campaigns awaiting review, approve/reject) and a "Make admin" action on the users page; sidebar shows Reviews; navbar surfaces a Fundraising link for fundraisers.

Verified: 40/40 automated API E2E checks against live Neon + local server (application lifecycle and one-open-at-a-time rule, role activation on re-login, campaign review gate and public-visibility gating, ownership 403s across campaigns/beneficiaries/disbursements, admin-only verification, the full cumulative-cap threshold behaviour including that admin-approved payouts do not consume the allowance, self-approval prevention, and admin promotion including self-promotion block). Server and client typecheck, lint (0 errors), and build clean; both dev servers boot and the client proxies the API. Test data was cleaned up. Not yet done: a manual browser click-through of every fundraiser screen.

Next up: Stage 8 — Testing (manual, responsive, accessibility, performance, security), then Stage 9 Deployment.

---

# Post-Stage 7 UX and branding pass

A round of user-requested polish on top of Stage 7:

- Brand renamed Changia → ChangiaTanzania across user-facing surfaces (APP_NAME, tab title/meta, PDF receipt brand, email from/subject, verify-page copy).
- Replaced the placeholder favicon (a recolored Vite lightning bolt) with a proper teal ChangiaTanzania mark; the browser tab no longer shows a Vite logo.
- Email-or-username sign-in: users gained an optional unique `username` (schema + migration, stored lowercased). Registration offers a username field; the login field accepts an email or username, resolved by whether it contains "@". Existing accounts keep signing in by email. Login now routes fundraisers to their dashboard.
- Public-page motion: added a reduced-motion-aware route transition (framer-motion `m` + AnimatePresence, keyed on pathname) so navigating between public pages fades and rises; the landing hero already animated via LazyMotion. A shared motion kit (Stagger/StaggerItem/FadeInUp/GradientHeader) lives in components/shared/motion.tsx.
- Restyled the donor and fundraiser post-login pages: gradient headers, a refreshed StatCard (tinted icon chip, hover lift), and staggered card entrances.
- Admin console aligned with the fundraiser architecture: campaign list shows owner and all six statuses with tone-coded badges; the dashboard shows a "N awaiting your review" banner linking to the Reviews queue.
- Public "Start a campaign" entry point: a visible nav link (desktop + mobile) and a landing closing-CTA link route by role — a visitor to sign-up with the fundraiser type pre-selected (`/register?type=fundraiser`), a donor to the become-a-fundraiser flow, and fundraisers/admins straight to their dashboard. Discoverability no longer depends on opening the register form.
- Authenticated-experience cohesion pass: the account page gained a profile gradient header (initials avatar, role badge, username/email, member-since) with staggered cards; the fundraiser manage page header matches the dashboard's gradient header; and a shared BrandMark (teal tile + check, mirroring the favicon) now sits beside the wordmark in the navbar, mobile menu, and auth shell.

Frontend design changes above are verified by typecheck, lint (0 errors), production build, and the Vite dev server transforming/serving every new module; not yet click-tested in a browser.

Verified: 52/53 automated E2E checks pass against live Neon + local server (the one failure was a transient Neon ETIMEDOUT during a cold start, not a code defect — its query already reflected the new username column). Added checks cover username registration, sign-in by username and by email, and duplicate-username rejection. Client and server typecheck, lint (0 errors), and build clean. Not yet done: a manual browser click-through of the animations and restyled pages.

---

# Pending

Testing

Deployment

---

# Important Decisions

The following architectural decisions have been finalized.

✓ React Frontend

✓ Express Backend

✓ PostgreSQL Database

✓ Solidity Smart Contracts

✓ Hardhat

✓ Ethers.js

✓ JWT Authentication

✓ Tailwind CSS

✓ shadcn/ui

✓ Revolut-inspired UI

✓ Blockchain as verification layer only

✓ PostgreSQL as primary database (Decision 015)

✓ Backend communicates with blockchain

✓ Backend communicates with payment gateway

✓ AzamPay as payment gateway (Decision 009)

✓ Minimal on-chain proof payload (Decision 010)

✓ API consolidation (Decision 011)

✓ Repository layer in backend (Decision 012)

✓ Business rule resolutions (Decision 013)

✓ Supporting libraries (Decision 014)

---

# Current Priority

The immediate focus is:

1. Scaffold client, server and contracts (Stage 1)

2. Encode the design system as theme tokens

3. Build reusable UI components

4. Complete the public website (landing, campaigns, about, contact)

5. Implement authentication

6. Develop campaign module

7. Integrate AzamPay payments

8. Connect blockchain

9. Complete dashboards and reports

10. Testing and deployment
