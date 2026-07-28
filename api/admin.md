# ADMIN API

## Base URL

/api/admin

Authentication

Administrator Only

---

# Dashboard Statistics

GET /dashboard

Returns

Total Donations

Active Campaigns

Beneficiaries

Recent Donations

Monthly Statistics

---

# Users

GET /users

Returns

Paginated user list.

---

GET /users/:id

User Details

---

PATCH /users/:id/status

Activate

Suspend

Deactivate

---

# Fundraisers

Directory of fundraiser accounts with the approval queue built in (Decision 024). Donors and fundraisers are separate actors; there is no role promotion (the former POST /users/:id/promote is removed, and administrators are created only by the seed script).

GET /fundraisers

Returns fundraiser accounts with their approval state (pending, approved, rejected), account status, and per-fundraiser campaign totals (count and amount raised).

Supports

Status Filter (application status)

Search (name, email, or organisation)

Pagination

---

POST /fundraisers/:id/approve

Approve a pending fundraiser account, unlocking campaign creation, and notify them. `:id` is the application id from the directory row.

---

POST /fundraisers/:id/reject

Request

Reason

Reject a pending fundraiser account with a reason and notify them. The account keeps the fundraiser role but cannot create campaigns.

---

# Campaign Review

Campaigns submitted by fundraisers wait in Pending Review.

The review queue is the campaign list filtered by status = pending_review (GET /api/campaigns?status=pending_review, administrator scope).

Approve and reject actions are POST /api/campaigns/:id/approve and POST /api/campaigns/:id/reject (see api/campaigns.md). Administrator only.

---

# Beneficiaries

Managed at /api/beneficiaries (see api/beneficiaries.md).

Fundraisers may add and edit beneficiaries on their own campaigns; verification is Administrator only.

---

# Disbursements

Managed at /api/disbursements (see api/disbursements.md).

Fundraisers may initiate payouts on their own campaigns up to the self-serve allowance; payouts at or above the cumulative threshold require Administrator approval.

---

# Reports

Managed at /api/reports (see api/reports.md).

Administrator only.

---

# Audit Logs

GET /audit

Supports

Pagination

Filtering

Search

---

# Notifications

POST /notifications

Create announcement.

GET /notifications

View all notifications.

DELETE /notifications/:id

Remove notification.

---

# Blockchain

Managed at /api/blockchain (see api/blockchain.md).

/api/blockchain/status and /api/blockchain/events are Administrator only.

---

# System Health

GET /health

Returns

API Status

Database Status

Blockchain Status

Payment Status

Storage Status

Version

Uptime