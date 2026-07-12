# DATABASE SCHEMA

## Overview

SQLite is the primary database of the application.

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

## blockchain_records

Stores blockchain proof references.

---

## password_resets

Stores password reset tokens.

---

## sessions

Stores active login sessions.

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

---

# Primary Keys

Every table uses

INTEGER PRIMARY KEY AUTOINCREMENT

except blockchain hashes.

---

# Foreign Keys

All relationships enforce foreign key constraints.

SQLite foreign_keys pragma must always be enabled.

---

# Soft Deletes

Campaigns

Users

Beneficiaries

should support soft deletion whenever possible.

Donation records must never be deleted.

Blockchain records must never be deleted.