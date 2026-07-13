# DATABASE SCHEMA

## Overview

PostgreSQL is the primary database of the application.

Every entity in the application is represented as a relational table.

Blockchain is NOT part of the relational schema.

---

# Tables

The application contains the following tables.

## users

Stores user accounts.

---

## campaigns

Stores fundraising campaigns.

---

## donations

Stores every completed donation.

---

## beneficiaries

Stores beneficiary information.

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

Stores fund disbursements from campaigns to verified beneficiaries.

---

## disbursement_approvals

Stores approval decisions for disbursements requiring dual approval.

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