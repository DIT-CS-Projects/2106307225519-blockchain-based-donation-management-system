# Reports API

## Purpose

Generate operational and financial reports for administrators.

---

# Endpoints

## Dashboard Summary

GET

```http
/api/reports/dashboard
```

Returns dashboard statistics.

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
* Pending Campaigns
* Total Beneficiaries
* Registered Donors
* Blockchain Transactions
* Donation Growth

---

# Permissions

Administrator only.
