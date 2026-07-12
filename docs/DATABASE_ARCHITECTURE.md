# DATABASE ARCHITECTURE

## Overview

SQLite is the primary operational database for the application.

All application data is stored in SQLite except blockchain proof information.

SQLite was selected because:

- Lightweight
- Fast
- Easy to maintain
- Ideal for Final Year Project
- No separate database server required

The architecture is designed so SQLite can later be replaced by PostgreSQL with minimal code changes.

---

# Database Responsibilities

SQLite stores all application data including:

- Users
- Campaigns
- Donations
- Beneficiaries
- Notifications
- Reports
- Audit Logs
- Payment Records

SQLite is considered the system of record.

---

# Main Tables

## Users

Stores:

- User ID
- Full Name
- Email
- Phone Number
- Password Hash
- Role
- Profile Photo
- Account Status
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
- Status
- Created By

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
- Location
- Campaign
- Image

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

One User

↓

Many Notifications

---

# Design Principles

The database should:

- Minimize duplication
- Preserve integrity
- Maintain consistency
- Support future migration
- Be easy to query