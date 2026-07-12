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

POST /beneficiaries

PUT /beneficiaries/:id

DELETE /beneficiaries/:id

GET /beneficiaries

---

# Reports

GET /reports/donations

GET /reports/campaigns

GET /reports/payments

GET /reports/audit

Exports

CSV

Excel

PDF

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

GET /blockchain/status

GET /blockchain/events

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