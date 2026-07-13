# SYSTEM ARCHITECTURE

## Introduction

The Blockchain-Based NGO Donation Management System follows a modular three-tier architecture.

The system separates responsibilities between the frontend, backend, database, blockchain layer and payment layer.

This separation improves maintainability, scalability and readability.

---

# High-Level Architecture

React Frontend

↓

Express Backend

↓

PostgreSQL Database

↓

Blockchain Smart Contracts

↓

Payment Gateway

---

# Frontend Layer

Responsibilities:

- User Interface
- User Experience
- Form Validation
- API Requests
- Authentication State
- Dashboard Rendering
- Responsive Layout

Technologies

- React
- Vite
- Tailwind CSS
- shadcn/ui
- Axios
- React Router
- Framer Motion

---

# Backend Layer

Responsibilities

- Business Logic
- Authentication
- Authorization
- Payment Processing
- Blockchain Communication
- Report Generation
- Notification Handling
- API Services

Technologies

- Node.js
- Express.js

---

# Database Layer

Responsibilities

- Store users
- Store campaigns
- Store donations
- Store beneficiaries
- Store reports
- Store notifications
- Store audit logs

Technology

PostgreSQL

---

# Blockchain Layer

Responsibilities

- Record donation proof
- Store immutable transaction hash
- Verify completed donations

Technology

- Solidity
- Hardhat
- Ethers.js

Blockchain is NOT used as the primary database.

---

# Payment Layer

Responsibilities

- Process payments
- Confirm successful transactions
- Notify backend

Payment Gateway

AzamPay

Supported payment methods

- M-Pesa
- Airtel Money
- Mixx (formerly Tigo Pesa)
- HaloPesa
- Bank Transfer

Card payments (Visa, Mastercard) are a future enhancement.

---

# Data Flow

User

↓

Frontend

↓

Express API

↓

PostgreSQL

↓

Payment Processing

↓

Blockchain Verification

↓

Confirmation Response

---

# Benefits

The architecture provides:

- Clear separation of concerns
- Easier maintenance
- Better scalability
- Improved security
- Easier testing
- Modular development