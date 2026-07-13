# Reports API

## Purpose

Generate operational and financial reports for administrators.

---

# Endpoints

## Dashboard Summary

Dashboard statistics are served at GET /api/admin/dashboard (see api/admin.md).

---

## Public Platform Statistics

GET

```http
/api/stats
```

Public. No authentication required.

Returns landing page statistics:

* Total Donations
* Total Campaigns
* Verified Donations
* Beneficiaries Helped

---

## Donation Report

GET

```http
/api/reports/donations
```

Returns donation analytics.

---

## Campaign Report

GET

```http
/api/reports/campaigns
```

Returns campaign performance.

---

## Beneficiary Report

GET

```http
/api/reports/beneficiaries
```

Returns beneficiary statistics.

---

## Disbursement Report

GET

```http
/api/reports/disbursements
```

Returns disbursement analytics: total disbursed, per-campaign disbursed, pending approvals, and blockchain-verified disbursements.

---

## Blockchain Report

GET

```http
/api/reports/blockchain
```

Returns blockchain verification statistics.

---

# Export Formats

* PDF
* Excel
* CSV

---

# Dashboard Metrics

* Total Donations
* Active Campaigns
* Successful Payments
* Draft Campaigns
* Total Beneficiaries
* Registered Donors
* Blockchain Transactions
* Total Disbursed
* Available Balance
* Donation Growth

---

# Permissions

Administrator only, except GET /api/stats which is public.
