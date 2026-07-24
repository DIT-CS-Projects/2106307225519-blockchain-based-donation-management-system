# ADMIN DASHBOARD

## Purpose

The Administrator Dashboard is the control center of the platform.

It allows administrators to monitor donations, manage campaigns and oversee platform activity.

---

# Layout

Dashboard Layout

↓

Sidebar

↓

Top Navigation

↓

Statistics

↓

Recent Donations

↓

Campaign Overview

↓

Reports

↓

Audit Logs

↓

Notifications

---

# Sidebar

Contains

Dashboard

Reviews (fundraiser applications and campaigns awaiting approval)

Campaigns

Beneficiaries

Donations

Disbursements

Reports

Users

Notifications

Settings

Logout

A badge on Reviews shows the count of pending fundraiser applications plus campaigns in Pending Review.

---

# Statistics

Display

Total Donations

Total Revenue

Active Campaigns

Beneficiaries

Registered Users

Blockchain Transactions

---

# Recent Donations

Table

Donor

Campaign

Amount

Payment Status

Blockchain Status

Date

Actions

---

# Campaign Overview

Cards

Campaign Name

Progress

Remaining Days

Raised Amount

Target Amount

Status

---

# Reviews

Two queues (Decision 020).

Fundraiser Applications

- Applicant, cause, identity reference, submitted date
- Approve promotes the applicant to fundraiser
- Reject requires a reason

Campaigns Awaiting Review

- Campaign, owner, category, target, submitted date
- Approve sets the campaign Active and public
- Reject requires a reason; the owner is notified

API

GET /admin/fundraiser-applications, POST /admin/fundraiser-applications/:id/approve, POST /admin/fundraiser-applications/:id/reject

GET /campaigns?status=pending_review, POST /campaigns/:id/approve, POST /campaigns/:id/reject

---

# Disbursements

Table

Campaign

Beneficiary

Amount

Status

Initiated By

Approved By

Date

Actions

Pending approvals are highlighted.

Payouts may be initiated by a campaign's fundraiser owner or an administrator. Approval, when required, is administrator-only and never the initiator.

The dual-approval threshold applies to a campaign's cumulative self-released total, not a single payout.

Available balance and self-serve remaining are shown per campaign before initiating a disbursement.

---

# Reports

Quick access

Donation Report

Campaign Report

Beneficiary Report

Audit Report

Export PDF

Export Excel

Export CSV

---

# Audit Logs

Display

Admin

Action

Entity

Date

Search

Filter

Pagination

---

# Notifications

Latest announcements

Failed payments

Blockchain alerts

System alerts

---

# Charts

Donation Trend

Campaign Performance

Payment Methods

Monthly Growth

---

# API Calls

GET /dashboard

GET /reports

GET /audit

GET /notifications

GET /campaigns

GET /users

---

# Loading

Skeleton Dashboard

Skeleton Charts

---

# Empty

"No activity available."

---

# Error

Dashboard unavailable.

Retry Button.

---

# Mobile

Charts stack vertically.

Sidebar becomes drawer.

Tables become cards.

---

# Animation

Fade

Slide

Chart Animation

Hover Cards