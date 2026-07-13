# CAMPAIGN API

Base URL

/api/campaigns

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

Admin Only

Request

Title

Description

Category

Target Amount

Image

Start Date

End Date

Response

201 Created

---

# Update Campaign

PUT /:id

Admin Only

---

# Archive Campaign

PATCH /:id/archive

Admin Only

---

# Delete Campaign

DELETE /:id

Admin Only

Soft Delete

---

# Upload Campaign Image

POST /upload

Admin Only

Image Validation

Max Size

Supported Formats

jpg

jpeg

png

webp