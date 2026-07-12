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
* Contact Information
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

A beneficiary can be associated with one or more campaigns.

Campaign → Beneficiary

One-to-many relationship.
