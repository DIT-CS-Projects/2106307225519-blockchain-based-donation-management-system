# AUTHENTICATION PAGES

## Pages

Login

Register

Forgot Password

Reset Password

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

Donor → Campaign Listing Page

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

Create a donor or fundraiser account (Decision 021).

---

Account Type

A choice at the top of the form: Donor or Fundraiser (default Donor). Selecting Fundraiser reveals the fundraiser fields below and grants the fundraiser role immediately on sign-up.

Fields

Full Name

Email

Username

Phone

Password

Confirm Password

Fundraiser only: Name you fundraise under, Your cause, National ID or registration number

---

Validation

Email Unique

Username Required and Unique

Password Strength

Passwords Match

Fundraiser fields required when Fundraiser is selected

---

API

POST /auth/register

---

Success

Account Created

Auto Login

Donor: redirect to the campaign listing page

Fundraiser: redirect to the fundraiser dashboard

---

Error

Display validation messages.

---

Responsive

Single-column form on mobile.