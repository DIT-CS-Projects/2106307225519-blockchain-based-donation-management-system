# COMPONENT LIBRARY

## Purpose

The project follows a reusable component architecture.

Components should never be duplicated.

If a component already exists, reuse it.

---

# Layout Components

Navbar

Sidebar

Footer

Dashboard Layout

Public Layout

Authentication Layout

---

# Navigation Components

Navigation Links

Breadcrumbs

Tabs

Pagination

Search Bar

Notification Bell

User Dropdown

---

# UI Components

Primary Button

Secondary Button

Ghost Button

Danger Button

Badge

Spinner

Progress Bar

Divider

Avatar

Tooltip

Modal

Drawer

Dropdown

Accordion

Skeleton Loader

---

# Form Components

Input

Password Input

Textarea

Select

Checkbox

Radio Button

Switch

Date Picker

Image Upload

Donation Amount Selector

Payment Method Selector

---

# Card Components

Campaign Card

Donation Card

Activity Card

Beneficiary Card

Statistic Card

Report Card

Notification Card

---

# Table Components

Campaign Table

Donation Table

Audit Table

User Table

Beneficiary Table

---

# Dashboard Widgets

Total Donations

Campaign Progress

Monthly Donations

Recent Activity

Notifications

Top Campaigns

Payment Statistics

---

# Feedback Components

Toast

Alert

Confirmation Dialog

Loading Screen

Empty State

Error Screen

Success Screen

---

# Blockchain Components

Blockchain Badge

Verification Status

Transaction Hash

Copy Hash Button

Blockchain Explorer Link

---

# Payment Components

Payment Method Card

Payment Success Screen

Payment Failure Screen

Receipt Viewer

Receipt Download Button

---

# Reusability Rules

Components must:

- Accept props
- Avoid business logic
- Be reusable
- Be documented
- Be independently testable

---

# Naming Convention

Component names use PascalCase.

Examples:

CampaignCard.jsx

DonationTable.jsx

NotificationBell.jsx

PrimaryButton.jsx

Avoid generic names such as:

Card.jsx

Button.jsx

Item.jsx

Container.jsx

unless they are truly generic reusable primitives.