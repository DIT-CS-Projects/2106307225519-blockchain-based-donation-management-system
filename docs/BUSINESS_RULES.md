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

---

# Donation Rules

Every donation must belong to one campaign.

Every donation must belong to one donor.

Every completed donation generates:

- Receipt
- Donation Record
- Blockchain Proof

Cancelled payments do not generate blockchain transactions.

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