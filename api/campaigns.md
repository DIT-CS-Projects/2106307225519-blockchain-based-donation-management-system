# CAMPAIGN API

Base URL

/api/campaigns

Ownership (Decision 020): every campaign has an owner. A fundraiser owns the campaigns they create and may manage only those; an administrator may manage any campaign. Endpoints marked "Owner or Administrator" authorize the campaign's owner or any administrator; a fundraiser acting on a campaign they do not own receives 403.

---

# Get Campaigns

GET /

Public

Supports

Search

Category

Featured Filter

Pagination

Sorting

Response

200 OK

[
  Campaign
]

---

# Campaign Details

GET /:id

Public

Returns

Complete campaign information

Beneficiaries

Donation Progress

Related Campaigns

---

# Recommended Campaigns

GET /recommended

Authentication Required

Returns

Newest active campaigns (v1 logic — donation-history based recommendations are a future enhancement).

---

# Create Campaign

POST /

Fundraiser or Administrator

Request

Title

Description

Category

Target Amount

Image

Start Date

End Date

Behaviour

- The creator becomes the campaign owner
- A fundraiser's campaign is created in Pending Review and does not appear publicly until an administrator approves it
- An administrator may publish directly (created as Draft or Active)

Response

201 Created

---

# Submit Campaign for Review

POST /:id/submit

Owner or Administrator

Behaviour

- Moves a Draft campaign to Pending Review
- Only the campaign owner or an administrator may submit

---

# Approve Campaign

POST /:id/approve

Administrator only.

Behaviour

- Only a campaign in Pending Review can be approved
- Status becomes Active
- The owning fundraiser is notified

---

# Reject Campaign

POST /:id/reject

Administrator only.

Request

Reason

Behaviour

- Only a campaign in Pending Review can be rejected
- Status becomes Rejected
- The owning fundraiser is notified with the reason

---

# Update Campaign

PUT /:id

Owner or Administrator

---

# Archive Campaign

PATCH /:id/archive

Owner or Administrator

---

# Delete Campaign

DELETE /:id

Owner or Administrator

Soft Delete

---

# Upload Campaign Image

POST /upload

Fundraiser or Administrator

Image Validation

Max Size

Supported Formats

jpg

jpeg

png

webp