# BUSINESS RULES

This document defines the business rules that govern the platform.

These rules must not be violated during development.

---

# User Roles

The system contains three user roles: donor, fundraiser, and administrator (Decision 020). At registration a person chooses to sign up as a donor or as a fundraiser; choosing fundraiser grants the role immediately (Decision 021). An existing donor can also upgrade to fundraiser by submitting an application that an administrator approves. An administrator can promote a user to administrator; the administrator role is never self-assignable.

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
- Apply to become a fundraiser

Donors cannot:

- Create campaigns
- Approve campaigns
- Manage beneficiaries
- Access reports
- Access audit logs

---

## Fundraiser

A fundraiser is a verified user who may run campaigns, whether they registered directly as a fundraiser (Decision 021) or upgraded from a donor account. In addition to everything a donor can do, a fundraiser can:

- Create campaigns they own (each starts in Pending Review until an administrator approves it)
- Edit and archive their own campaigns
- Add beneficiaries to their own campaigns (verification stays administrator-only)
- Initiate payouts from their own campaigns to verified beneficiaries, up to the self-serve allowance (see Disbursement Rules)
- View activity and reports scoped to their own campaigns

A fundraiser can only ever act on the campaigns they own. A fundraiser cannot verify beneficiaries, approve campaigns, release payouts above the self-serve allowance, access platform-wide reports or the audit log, or manage other users.

---

## Administrator

An administrator is a neutral platform operator. There may be several. An administrator can:

- Manage users, including promoting a user to administrator
- Approve or reject fundraiser applications
- Review, approve, or reject fundraiser campaigns
- Create campaigns (may publish directly, without review)
- Edit or archive any campaign
- Manage and verify beneficiaries on any campaign
- Disburse funds to beneficiaries and approve or reject payouts above the self-serve allowance
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
- Pending Review
- Active
- Rejected
- Completed
- Archived

Every campaign has an owner. Fundraisers own and manage only the campaigns they create; administrators manage all campaigns (Decision 020).

A campaign created by a fundraiser starts in Pending Review and becomes Active only after an administrator approves it. An administrator may reject it with a reason (status Rejected). A campaign created by an administrator may publish directly to Active.

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

A beneficiary is added by the owner of its campaign: a fundraiser on their own campaigns, or an administrator on any campaign.

Verification is administrator-only. Only an administrator may verify a beneficiary, regardless of who added it.

Each beneficiary belongs to exactly one campaign.

A beneficiary must be verified before being displayed publicly.

A beneficiary must be verified before receiving a disbursement.

Beneficiaries are soft deleted, never hard deleted.

---

# Disbursement Rules

A payout is initiated by the owner of its campaign: a fundraiser on their own campaigns, or an administrator on any campaign.

Funds are paid out from a campaign to a verified beneficiary of that campaign.

A disbursement can never exceed the campaign's available balance (total raised minus total disbursed).

The dual-approval threshold is 1,000,000 TZS, a named constant. It applies to the cumulative amount already released without administrator approval on a campaign, not to a single payout (Decision 020).

- While the running self-released total on a campaign stays below the threshold, a fundraiser or administrator payout releases without a second approval.
- The payout that would cross the threshold, and every payout after it on that campaign, requires approval from an administrator.
- For administrator-initiated payouts this is the existing rule: a second administrator approves at or above the threshold.

The initiator can never approve their own disbursement. Any payout requiring approval must be approved by an administrator who did not initiate it.

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

The audit log records privileged activities including:

- campaign creation, modification, deletion, submission for review, approval, and rejection
- beneficiary management and verification
- disbursement initiation, approval, and rejection
- fundraiser application submission, approval, and rejection
- user status changes and promotion to administrator
- report generation
- login attempts
- blockchain verification
- administrative actions

Fundraiser actions on their own campaigns (campaign create/edit, beneficiary add, self-serve payout) are audited alongside administrator actions. Audit records are read-only and cannot be modified through the application.

---

# Dashboard Rules

After login:

Administrator → Admin Dashboard

Fundraiser → Campaign Listing Page (the fundraiser dashboard, covering their own campaigns, beneficiaries, and payouts, is reachable through navigation)

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