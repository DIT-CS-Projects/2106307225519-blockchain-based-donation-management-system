# AUTHENTICATION PAGES

## Pages

Login

Register

Forgot Password (Future)

Reset Password (Future)

---

# Login

Purpose

Authenticate donor or administrator.

---

Layout

Logo

↓

Welcome Message

↓

Login Form

↓

Remember Me

↓

Login Button

↓

Register Link

---

Fields

Email

Password

Remember Me

---

Validation

Required

Valid Email

Password Length

---

API

POST /auth/login

---

Success

Redirect

Donor → Dashboard

Admin → Admin Dashboard

---

Error

Incorrect credentials.

---

Loading

Disable Button

Spinner

---

Animation

Fade

Scale

---

# Register

Purpose

Create donor account.

---

Fields

Full Name

Email

Phone

Password

Confirm Password

---

Validation

Email Unique

Phone Unique

Password Strength

Passwords Match

---

API

POST /auth/register

---

Success

Account Created

Auto Login

Redirect Dashboard

---

Error

Display validation messages.

---

Responsive

Single-column form on mobile.