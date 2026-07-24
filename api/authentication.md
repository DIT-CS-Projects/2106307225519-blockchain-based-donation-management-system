# AUTHENTICATION API

## Base URL

/api/auth

---

# Register

POST /register

Description

Create a new account as a donor or, by choice, a fundraiser (Decision 021). A fundraiser account receives the fundraiser role immediately; the additional fields capture the applicant's identity and cause and are stored as an auto-approved fundraiser application.

Authentication

Not Required

Request

{
  "fullName": "",
  "email": "",
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
- Unique phone
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

# Become a Fundraiser

POST /fundraiser-application

Authentication Required (donor)

Submits an application to become a fundraiser (Decision 020). An administrator reviews it (see api/admin.md). Approval promotes the account's role to fundraiser.

Request

- Organisation or individual name
- Cause description
- Identity reference (national ID or registration number)
- Contact phone

Behaviour

- Only a donor may apply; a fundraiser or administrator receives 409
- One open (pending) application at a time
- A rejected applicant may re-apply

---

GET /fundraiser-application

Authentication Required

Returns the current user's latest application and its status (pending, approved, rejected), or none.

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