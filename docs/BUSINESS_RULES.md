# BUSINESS RULES

This document defines the business rules that govern the platform.

These rules must not be violated during development.

---

# User Roles

The system contains only two primary user roles.

## Donor

A donor can:

- Register
- Login
- Browse campaigns
- Donate
- View donation history
- View blockchain verification
- Manage profile
- Receive notifications

Donors cannot:

- Create campaigns
- Approve campaigns
- Manage beneficiaries
- Access reports
- Access audit logs

---

## Administrator

An administrator can:

- Manage users
- Create campaigns
- Edit campaigns
- Archive campaigns
- Manage beneficiaries
- Disburse funds to beneficiaries
- Approve or reject disbursements
- View reports
- View audit logs
- Verify blockchain records
- Monitor donations

---

# Campaign Rules

Every campaign must contain:

- Title
- Description
- Category
- Target Amount
- Current Amount
- Start Date
- End Date
- Status
- Featured Image

Campaign status may be:

- Draft
- Active
- Completed
- Archived

Campaigns may be marked as Featured to appear on the landing page.

Donations are accepted only while a campaign is Active and within its start and end dates.

Campaigns may exceed their target amount.

A campaign automatically becomes Completed after its end date.

---

# Donation Rules

Every donation must belong to one campaign.

Every donation must belong to one donor.

Every completed donation generates:

- Receipt
- Donation Record
- Blockchain Proof

Cancelled payments do not generate blockchain transactions.

The minimum donation amount is 1,000 TZS, defined as a named constant.

---

# Beneficiary Rules

Beneficiaries are managed only by administrators.

Each beneficiary belongs to exactly one campaign.

A beneficiary must be verified before being displayed publicly.

A beneficiary must be verified before receiving a disbursement.

Beneficiaries are soft deleted, never hard deleted.

---

# Disbursement Rules

Only administrators may disburse funds.

Funds are paid out from a campaign to a verified beneficiary of that campaign.

A disbursement can never exceed the campaign's available balance (total raised minus total disbursed).

Disbursements at or above the dual-approval threshold (1,000,000 TZS, a named constant) require approval from a second administrator.

The initiating administrator can never approve their own disbursement.

Every completed disbursement generates exactly one blockchain proof.

Disbursement records are immutable and never deleted.

---

# Payment Rules

Payments are completed using Tanzanian payment methods.

Blockchain never processes payments.

Payment confirmation must occur before blockchain recording.

---

# Blockchain Rules

Blockchain stores only proof information.

Sensitive user information must never be stored on-chain.

Each completed donation produces exactly one blockchain transaction.

---

# Notification Rules

Notifications are generated when:

- donation succeeds
- campaign updates
- administrator announcements
- profile changes
- important security events

---

# Audit Rules

The audit log records administrator activities including:

- campaign creation
- campaign modification
- campaign deletion
- beneficiary management
- report generation
- login attempts
- blockchain verification
- administrative actions

Audit records are read-only and cannot be modified through the application.

---

# Dashboard Rules

After login:

Administrator → Admin Dashboard

Donor → Campaign Listing Page

The donor dashboard remains accessible through navigation but is not the initial landing page.

---

# UI Rules

Every page should provide:

- loading state
- empty state
- success state
- error state
- responsive layout
- accessible components

The interface should follow the premium design principles defined in the UI/UX Guide.