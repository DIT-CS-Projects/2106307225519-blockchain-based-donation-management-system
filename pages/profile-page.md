# PROFILE PAGE

## Purpose

The Profile Page allows users to manage their personal information and account settings.

The experience should be simple, secure and familiar.

---

# Layout

Dashboard Layout

↓

Profile Header

↓

Personal Information

↓

Security

↓

Donation Summary

↓

Preferences

↓

Danger Zone

---

# Profile Header

Profile Picture

Full Name

Role

Member Since

Verification Badge

---

# Personal Information

Fields

Full Name

Email

Phone Number

Profile Picture

Save Button

---

# Security

Change Password

Current Password

New Password

Confirm Password

Password Strength Indicator

---

# Donation Summary

Display

Total Donations

Campaigns Supported

Verified Donations

Receipts Downloaded

---

# Become a Fundraiser

Shown to donors only (Decision 020).

Donor

- Explains what a fundraiser can do
- "Apply to fundraise" opens the application form (name, cause, identity reference, contact)
- After submitting, shows Pending state
- If rejected, shows the reason and allows re-applying

Fundraiser

- Shows a "Fundraiser" badge and a link to the fundraiser dashboard instead of the apply card

API

POST /fundraiser-application

GET /fundraiser-application

---

# Preferences

Language

Theme (Future)

Notification Preferences

Email Preferences

SMS Preferences (Future)

---

# Danger Zone

Delete Account (Future)

Deactivate Account

Logout All Devices (Future)

---

# API Calls

GET /me

PUT /profile

PUT /change-password

---

# Loading

Skeleton Profile

---

# Success

Toast

"Profile updated successfully."

---

# Error

Validation messages

Friendly error messages

---

# Mobile

Single-column layout

Large touch targets

Sticky Save Button

---

# Animation

Fade

Slide

Avatar Hover

Button Loading