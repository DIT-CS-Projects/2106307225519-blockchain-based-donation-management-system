# DEVELOPMENT STANDARDS

## Purpose

This document defines the coding standards used throughout the project.

Every developer and AI coding agent must follow these standards.

Consistency is more important than personal preference.

---

# General Principles

Code should be:

- Clean
- Readable
- Reusable
- Testable
- Maintainable

Avoid unnecessary complexity.

---

# Naming Convention

Variables

camelCase

Example:

donationAmount

---

Functions

camelCase

Example:

createDonation()

---

Components

PascalCase

Example:

CampaignCard.jsx

---

Files

Use meaningful names.

Avoid:

button.jsx

card.jsx

item.jsx

Prefer:

PrimaryButton.jsx

DonationCard.jsx

NotificationBell.jsx

---

Folders

Use lowercase.

Example:

components/

layouts/

services/

pages/

---

# Component Rules

Each component should:

- Have one responsibility
- Accept props
- Avoid duplicated code
- Be reusable
- Be easy to test

---

# API Rules

Controllers

↓

Services

↓

Database

Never place business logic inside routes.

---

# Comments

Write comments only when necessary.

Good code should explain itself.

Avoid obvious comments.

---

# Error Handling

Always handle:

- API failures
- Invalid input
- Empty responses
- Payment failures
- Blockchain failures

Never ignore errors.

---

# Code Formatting

Use ESLint.

Use consistent indentation.

Avoid unused imports.

Remove dead code.

---

# Git Commits

Use meaningful commit messages.

Examples:

feat: add donor dashboard

fix: payment callback bug

docs: update blockchain architecture

refactor: improve authentication service

---

# Testing

Every feature should be manually tested before commit.

Verify:

- Desktop
- Tablet
- Mobile

Test both success and failure scenarios.

---

# Documentation

Whenever a new feature is added:

Update:

Documentation

API Specification

Database Schema

Feature Specification

Never allow documentation to become outdated.