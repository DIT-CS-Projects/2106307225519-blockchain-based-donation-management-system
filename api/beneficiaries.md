# Beneficiaries API

## Purpose

The Beneficiaries API manages individuals, communities, or organizations receiving assistance through fundraising campaigns.

---

# Endpoints

## Get All Beneficiaries

GET

```http
/api/beneficiaries
```

Returns all beneficiaries.

---

## Get Beneficiary

GET

```http
/api/beneficiaries/:id
```

Returns beneficiary details.

---

## Create Beneficiary

POST

```http
/api/beneficiaries
```

Admin only.

Request

* Name
* Description
* Category
* Location
* Contact Information
* Image
* Campaign ID
* Verification Status

---

## Update Beneficiary

PUT

```http
/api/beneficiaries/:id
```

Updates beneficiary information.

---

## Delete Beneficiary

DELETE

```http
/api/beneficiaries/:id
```

Soft delete.

---

# Validation

* Required fields
* Valid contact details
* Duplicate prevention
* Verification before campaign assignment

---

# Permissions

Administrator

* Full access

Donor

* Read-only access to approved beneficiaries

---

# Relationships

Each beneficiary belongs to exactly one campaign.

Campaign → Beneficiaries

One-to-many relationship.

If the same real-world beneficiary is assisted by another campaign, a separate beneficiary record is created for that campaign.
