# DATABASE ARCHITECTURE

## Overview

PostgreSQL is the primary operational database for the application.

All application data is stored in PostgreSQL except blockchain proof information.

PostgreSQL was selected because (Decision 015):

- Industry-standard relational database
- Strong integrity, constraints and transactions
- Safe concurrent writes (payment callbacks, disbursement approvals)
- Proper money handling (BIGINT amounts in TZS)
- Free managed hosting for easy deployment

Local development uses a local PostgreSQL instance or Docker.

---

# Database Responsibilities

PostgreSQL stores all application data including:

- Users
- Campaigns
- Donations
- Beneficiaries
- Disbursements
- Notifications
- Reports
- Audit Logs
- Payment Records

PostgreSQL is considered the system of record.

---

# Main Tables

## Users

Stores:

- User ID
- Full Name
- Email
- Phone Number
- Password Hash
- Role (donor, fundraiser, or administrator — Decision 020)
- Profile Photo
- Account Status
- Created Date

---

## Fundraiser Applications

Stores donor requests to become a fundraiser (Decision 020).

Stores:

- Application ID
- Applicant (User ID)
- Identity / cause details
- Status (pending, approved, rejected)
- Reviewed By (administrator User ID)
- Decision Reason
- Created Date

---

## Campaigns

Stores:

- Campaign ID
- Title
- Description
- Category
- Featured Image
- Target Amount
- Current Amount
- Start Date
- End Date
- Status (draft, pending review, active, rejected, completed, archived)
- Featured Flag
- Created By (the owner: a fundraiser or an administrator)

---

## Donations

Stores:

- Donation ID
- Donor ID
- Campaign ID
- Amount
- Currency
- Payment Method
- Payment Status
- Blockchain Hash
- Receipt Number
- Date

---

## Beneficiaries

Stores:

- Beneficiary ID
- Name
- Description
- Category
- Location
- Contact Information
- Payout Details
- Campaign
- Image
- Verification Status

---

## Disbursements

Stores:

- Disbursement ID
- Campaign ID
- Beneficiary ID
- Amount
- Purpose
- Status
- Initiated By
- Approved By
- Payment Reference
- Blockchain Hash
- Date

---

## Notifications

Stores:

- Notification ID
- User ID
- Title
- Message
- Type
- Read Status
- Created Date

---

## Reports

Stores generated reports metadata.

Reports are generated dynamically from existing data.

---

## Audit Logs

Stores administrator activities.

Examples:

- Login
- Campaign Created
- Campaign Edited
- Campaign Deleted
- Beneficiary Updated
- Report Generated

Audit records cannot be edited.

---

# Relationships

One User

↓

Many Donations

One Campaign

↓

Many Donations

One Campaign

↓

Many Beneficiaries

One Campaign

↓

Many Disbursements

One Beneficiary

↓

Many Disbursements

One User

↓

Many Notifications

---

# Data Access

The backend accesses PostgreSQL through Drizzle ORM (Decision 019).

Schemas are defined in server/src/database/schema.

Migrations are generated and applied with drizzle-kit.

All queries are parameterized and type-safe.

---

# Design Principles

The database should:

- Minimize duplication
- Preserve integrity
- Maintain consistency
- Support future migration
- Be easy to query