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

# Beneficiaries

Managed at /api/beneficiaries (see api/beneficiaries.md).

Write operations are Administrator only.

---

# Disbursements

Managed at /api/disbursements (see api/disbursements.md).

Administrator only. Large disbursements require dual approval.

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