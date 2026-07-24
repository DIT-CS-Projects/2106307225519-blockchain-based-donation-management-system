# PRODUCT REQUIREMENTS

## Overview

The platform is a web-based NGO Donation Management System that enables NGOs to manage fundraising campaigns while allowing donors to contribute securely using Tanzanian payment methods.

Blockchain enhances transparency by storing immutable donation proofs.

---

# Functional Requirements

The system shall allow users to:

## Authentication

- Register
- Login
- Logout
- Reset password
- Update profile

---

## Campaign Management

Fundraisers and administrators shall be able to:

- Create campaigns they own
- Edit campaigns
- Archive campaigns
- Delete campaigns
- Upload campaign images
- Set fundraising targets
- Update campaign progress

A fundraiser may act only on the campaigns they own, and their new campaigns go live only after administrator review. Administrators shall additionally be able to:

- Approve or reject fundraiser campaigns awaiting review
- Manage any campaign

Donors shall be able to:

- Browse campaigns
- Search campaigns
- Filter campaigns
- View campaign details
- Apply to become a fundraiser

---

## Donation Management

The system shall allow donors to:

- Select donation amount
- Choose payment method
- Complete payment
- Receive confirmation
- Download receipt
- View donation history

---

## Fund Disbursement

Campaign owners (fundraisers on their own campaigns, administrators on any) shall be able to:

- Disburse funds to verified beneficiaries
- View a campaign's available balance and self-serve remaining

Administrators shall additionally be able to:

- Approve or reject disbursements requiring administrator approval

The system shall:

- Apply the dual-approval threshold to the cumulative amount self-released on a campaign, not to a single payout (Decision 020)
- Require an administrator's approval once a campaign's cumulative self-released total would reach the threshold
- Prevent anyone from approving their own disbursement
- Generate a blockchain proof for every completed disbursement

---

## Blockchain

The system shall:

- Generate blockchain proof for donations and disbursements
- Store transaction hash
- Allow verification
- Allow public verification without an account
- Display verification status

---

## Notifications

Users shall receive notifications for:

- successful donations
- campaign updates
- important announcements
- account activities

---

## Reporting

Administrators shall generate reports for:

- donations
- campaigns
- beneficiaries
- payment summaries
- blockchain verification
- audit activities

---

# Non-Functional Requirements

The system should be:

- secure
- responsive
- scalable
- reliable
- maintainable
- user-friendly
- accessible

---

# Performance Requirements

- Fast page loading
- Responsive interface
- Efficient database operations
- Smooth animations
- Optimized API communication

---

# Security Requirements

- Password hashing
- JWT authentication
- Role-based authorization
- Input validation
- SQL injection protection
- Secure API communication

---

# Compatibility

The application should function correctly on:

- Chrome
- Edge
- Firefox
- Safari

and across desktop, tablet and mobile devices.