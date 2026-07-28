# AUTHENTICATION API

## Base URL

/api/auth

---

# Register

POST /register

Description

Create a new account as a donor or, by choice, a fundraiser (Decisions 021 and 024). Donors and fundraisers are separate actors chosen here at sign-up. A fundraiser account receives the fundraiser role immediately but stays pending administrator approval and cannot create campaigns until approved; the additional fields capture the applicant's identity and cause and are stored as a pending fundraiser application.

Authentication

Not Required

Request

{
  "fullName": "",
  "email": "",
  "username": "",
  "phone": "",
  "password": "",
  "accountType": "donor | fundraiser (default donor)",
  "displayName": "fundraiser only: name fundraised under",
  "causeDescription": "fundraiser only",
  "identityReference": "fundraiser only: national ID or registration number"
}

Validation

- Full name required
- Valid email
- Unique email
- Username required (3-30 chars, letters/numbers/underscore), unique; usable to sign in alongside email
- Strong password
- accountType is donor or fundraiser (default donor)
- When accountType is fundraiser: displayName, causeDescription, and identityReference are required
- accountType can never be administrator (admins are seeded or promoted)

Response

201 Created

{
  "message": "Registration successful",
  "user": {},
  "token": ""
}

Errors

400 Validation Error

409 Email Exists

500 Server Error

---

# Login

POST /login

Request

{
  "email": "",
  "password": ""
}

Response

200 OK

{
  "token":"",
  "user":{}
}

Errors

401 Invalid Credentials

500 Server Error

---

# Logout

POST /logout

Authentication Required

Response

200 OK

---

# Current User

GET /me

Authentication Required

Returns

Authenticated user profile.

---

# Update Profile

PUT /profile

Authentication Required

Fields

- Full Name
- Phone
- Profile Photo

---

# Change Password

PUT /change-password

Authentication Required

Request

Old Password

New Password

Confirm Password

---

# Fundraiser Approval Status

There is no "apply to become a fundraiser" endpoint (Decision 024). Donors and fundraisers are separate actors: a fundraiser is chosen at registration. Admin review of the resulting account happens in api/admin.md (Fundraisers).

GET /fundraiser-application

Authentication Required

Returns the signed-in fundraiser's application and its approval status (pending, approved, rejected), or none. Used by the fundraiser dashboard to show its locked "under review" state.

---

# Forgot Password

POST /forgot-password

Authentication

Not Required

Request

{
  "email": ""
}

Behaviour

- Always returns 200 (never reveals whether the email exists)
- Generates a single-use reset token stored in password_resets
- Token expires after 1 hour
- Sends a reset link by email

---

# Reset Password

POST /reset-password

Authentication

Not Required

Request

{
  "token": "",
  "newPassword": ""
}

Validation

- Valid unexpired token
- Strong password

Behaviour

- Updates password hash
- Invalidates the reset token
- Notifies the user