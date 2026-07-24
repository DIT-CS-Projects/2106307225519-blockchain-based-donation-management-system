# DATABASE SCHEMA

## Overview

PostgreSQL is the primary database of the application.

Every entity in the application is represented as a relational table.

Blockchain is NOT part of the relational schema.

---

# Tables

The application contains the following tables.

## users

Stores user accounts. The role column is one of donor, fundraiser, or administrator (Decision 020).

---

## fundraiser_applications

Stores donor requests to become a fundraiser, with the applicant's identity details and the administrator decision (pending, approved, rejected). Approval promotes the applicant's role to fundraiser.

---

## campaigns

Stores fundraising campaigns. Each campaign has an owner (the user who created it): a fundraiser owns the campaigns they create, and administrator-created campaigns are owned by that administrator. Fundraiser campaigns start in Pending Review until an administrator approves them.

---

## donations

Stores every completed donation.

---

## beneficiaries

Stores beneficiary information. A beneficiary is added by the owner of its campaign (fundraiser or administrator); verification is administrator-only.

---

## notifications

Stores user notifications.

---

## audit_logs

Stores administrator activities.

---

## payment_transactions

Stores payment provider responses.

---

## disbursements

Stores fund disbursements from campaigns to verified beneficiaries. A payout is initiated by the campaign owner (fundraiser or administrator). The initiated_by column records that user.

---

## disbursement_approvals

Stores approval decisions for disbursements that require administrator approval, that is, any payout that would take a campaign's cumulative self-released total to or above the dual-approval threshold (Decision 020).

---

## blockchain_records

Stores blockchain proof references.

This table is the authoritative source for blockchain proof data.

---

## password_resets

Stores password reset tokens.

---

## sessions

Stores active refresh-token sessions.

Enables token revocation and logout from all devices.

---

# Relationships

users

↓

donations

users

↓

fundraiser_applications

users

↓

campaigns (owner)

campaigns

↓

donations

campaigns

↓

beneficiaries

users

↓

notifications

donations

↓

blockchain_records

donations

↓

payment_transactions

campaigns

↓

disbursements

beneficiaries

↓

disbursements

---

# Primary Keys

Every table uses

BIGINT GENERATED ALWAYS AS IDENTITY

Monetary amounts are stored as BIGINT in whole Tanzanian Shillings.

---

# Foreign Keys

All relationships enforce foreign key constraints, natively enforced by PostgreSQL.

---

# Soft Deletes

Campaigns

Users

Beneficiaries

should support soft deletion whenever possible.

Donation records must never be deleted.

Disbursement records must never be deleted.

Blockchain records must never be deleted.