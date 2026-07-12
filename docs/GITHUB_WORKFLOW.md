# GITHUB WORKFLOW

## Overview

GitHub is the central source of truth for the project.

Every change should be tracked through Git.

The main branch must always remain stable.

---

# Branch Strategy

main

Production-ready code.

Never develop directly on main.

---

develop

Integration branch.

Completed features are merged here.

---

feature/*

Individual feature development.

Examples:

feature/authentication

feature/payments

feature/campaign-management

feature/blockchain

---

# Development Process

1. Pull latest develop

↓

2. Create feature branch

↓

3. Implement feature

↓

4. Test feature

↓

5. Commit changes

↓

6. Push branch

↓

7. Open Pull Request

↓

8. Merge into develop

↓

9. Merge develop into main after verification

---

# Commit Standards

Use conventional commits.

Examples:

feat:

fix:

refactor:

docs:

style:

test:

chore:

---

# Pull Requests

Every Pull Request should include:

- Summary
- Changes made
- Screenshots (if UI)
- Testing completed
- Related issues

---

# Versioning

Use Semantic Versioning.

Examples:

v0.1.0

v0.2.0

v1.0.0

---

# Releases

Milestone 1

Authentication

Campaign Management

Homepage

---

Milestone 2

Payments

Blockchain

Reports

---

Milestone 3

Notifications

Audit Logs

Beneficiaries

---

Milestone 4

Final Testing

Performance

Documentation

Deployment

---

# Repository Rules

Never commit:

node_modules/

.env

database backups

temporary files

logs

build artifacts

Always commit:

source code

documentation

configuration

README

licenses

---

# Issue Tracking

Every feature should have:

Description

Acceptance Criteria

Priority

Status

Assigned Developer

Estimated Completion

This ensures progress is measurable throughout development.