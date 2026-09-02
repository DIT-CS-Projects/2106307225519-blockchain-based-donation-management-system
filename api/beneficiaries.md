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

Campaign owner (fundraiser) or administrator. A fundraiser may add beneficiaries only to campaigns they own. A new beneficiary is always created unverified; verification is administrator-only (Decision 020).

Request

* Name
* Description
* Category
* Location
* Mobile Number
* Contact Information
* Image
* Campaign ID

---

## Update Beneficiary

PUT

```http
/api/beneficiaries/:id
```

Campaign owner or administrator. Updates beneficiary information.

Sending a blank mobile number clears the stored payout destination. Omitting the field leaves it unchanged.

---

## Verify Beneficiary

PATCH

```http
/api/beneficiaries/:id/verify
```

Administrator only. Sets or clears a beneficiary's verified status. A fundraiser can never verify their own beneficiary; this is the control that keeps a fundraiser from paying out to a fabricated payee (Decision 020).

---

## Delete Beneficiary

DELETE

```http
/api/beneficiaries/:id
```

Campaign owner or administrator. Soft delete.

---

# Validation

* Required fields
* Valid contact details
* Duplicate prevention
* Verification before campaign assignment

## Mobile Number

The payout destination for disbursements. Optional on create, since a beneficiary can be recorded before the number is known, but a disbursement cannot be initiated or approved without one.

Accepted entry forms: `0712345678`, `255712345678`, `+255712345678`. Stored normalized as `255XXXXXXXXX`. A blank value means "no payout number" rather than an invalid one.

The number is private. It appears only in the administrator and campaign-owner responses, never in the public beneficiary shape.

---

# Permissions

Administrator

* Full access on any campaign, including verification

Fundraiser

* Add, update, and soft-delete beneficiaries on campaigns they own
* Cannot verify beneficiaries

Donor

* Read-only access to verified beneficiaries

---

# Relationships

Each beneficiary belongs to exactly one campaign.

Campaign → Beneficiaries

One-to-many relationship.

If the same real-world beneficiary is assisted by another campaign, a separate beneficiary record is created for that campaign.
