# AUTHENTICATION API

## Base URL

/api/auth

---

# Register

POST /register

Description

Create a new donor account.

Authentication

Not Required

Request

{
  "fullName": "",
  "email": "",
  "phone": "",
  "password": ""
}

Validation

- Full name required
- Valid email
- Unique email
- Unique phone
- Strong password

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