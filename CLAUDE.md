# CLAUDE PROJECT INSTRUCTIONS

# Project

Blockchain-Based NGO Donation Management System

This repository contains the complete implementation of a production-quality Final Year Project.

The objective is NOT to create a university CRUD application.

The objective is to build software that feels like a modern fintech platform while demonstrating blockchain transparency.

Every decision should prioritize:

• Simplicity
• Maintainability
• Security
• Performance
• Scalability
• User Experience

---

# Golden Rules

Before writing ANY code:

Understand the existing architecture.

Never rewrite working code.

Never duplicate logic.

Always search the repository before creating a new component.

If a reusable component exists,
reuse it.

Never invent architecture that conflicts with existing documentation.

---

# Source of Truth

When unsure, consult documents in this order.

1.

docs/

Business requirements

↓

2.

database/

Schema

↓

3.

api/

API contracts

↓

4.

pages/

UI specifications

↓

5.

flows/

System behaviour

↓

6.

prompts/

Implementation rules

Never guess.

---

# Tech Stack

Frontend

React

Vite

React Router

Tailwind CSS v4

shadcn/ui

Framer Motion

Axios

React Hook Form

Lucide

Backend

Node.js

Express

PostgreSQL

JWT

bcrypt

Multer

Blockchain

Solidity

Hardhat

Ethers.js

Ethereum Sepolia

---

# Project Philosophy

Think like Stripe.

Design like Revolut.

Write code like Linear.

Keep architecture boring.

Avoid unnecessary abstractions.

Avoid over-engineering.

Prefer readability over cleverness.

---

# UI Philosophy

Every page must feel premium.

Spacing matters.

Typography matters.

Animation should be subtle.

The interface should inspire trust.

Never create clutter.

Never copy templates.

---

# Backend Philosophy

Controllers

↓

Services

↓

Repositories

↓

Database

Never skip layers.

Business logic belongs in services.

---

# Blockchain Philosophy

Blockchain stores proof only.

PostgreSQL stores operational data.

Backend communicates with blockchain.

Frontend never communicates directly with blockchain.

Never store personal data on-chain.

---

# Payment Philosophy

Backend owns payments.

Frontend only requests payment sessions.

Payment providers communicate with backend.

Only verified payments create donations.

Every donation has:

Receipt

Payment Reference

Blockchain Proof

Disbursements to beneficiaries are admin-initiated fiat payouts.

Large disbursements require dual admin approval.

Every completed disbursement has a blockchain proof.

---

# Coding Standards

Small files.

Reusable components.

Readable names.

No duplicated code.

No magic numbers.

Meaningful folder structure.

Maximum preferred component size:

200 lines.

Maximum preferred function size:

50 lines.

Refactor when necessary.

---

# Styling Rules

Tailwind first.

Theme variables only.

No random colors.

No inconsistent spacing.

All buttons use shared components.

All forms use shared components.

All tables use shared components.

---

# Accessibility

Keyboard navigation.

ARIA labels.

Focus states.

Readable contrast.

Responsive layouts.

---

# API Rules

Never call fetch directly.

Always use Axios service layer.

Never hardcode URLs.

Use environment variables.

---

# Database Rules

Parameterized queries only.

Foreign keys enabled.

Soft delete where appropriate.

Donation history is immutable.

---

# Security Rules

JWT authentication.

bcrypt hashing.

Validate every request.

Never trust client input.

Never expose secrets.

Never commit .env.

---

# Git Rules

Small commits.

Conventional commits.

Never commit broken code.

Run lint before commit.

Run build before commit.

---

# Definition of Done

A feature is complete only when:

✓ UI completed

✓ Backend completed

✓ Database completed

✓ Validation completed

✓ Error handling completed

✓ Loading states completed

✓ Empty states completed

✓ Responsive

✓ Accessible

✓ Lint passes

✓ Build passes

✓ Documentation updated

✓ Tested manually

Otherwise it is NOT complete.

---

# Expected Behaviour

When implementing any feature:

1.

Read documentation.

↓

2.

Understand dependencies.

↓

3.

Plan implementation.

↓

4.

Implement frontend.

↓

5.

Implement backend.

↓

6.

Connect API.

↓

7.

Test.

↓

8.

Refactor.

↓

9.

Document.

Never skip steps.

---

# AI Behaviour

Do not rewrite entire files for small fixes.

Prefer incremental changes.

Respect previous architecture.

Always explain important architectural decisions.

Never remove working functionality unless explicitly instructed.

Always preserve code quality.

Build production-quality software.