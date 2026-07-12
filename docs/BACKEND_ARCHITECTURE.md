# BACKEND ARCHITECTURE

## Overview

The backend serves as the central processing layer of the application.

It connects the frontend, database, blockchain and payment provider.

All business logic resides within the backend.

---

# Technology

Node.js

Express.js

SQLite

JWT

bcrypt

---

# Folder Structure

server/

controllers/

routes/

services/

middleware/

database/

config/

utils/

contracts/

---

# Responsibilities

Authentication

Authorization

Campaign Management

Donation Processing

Payment Processing

Blockchain Integration

Notification Management

Reporting

Audit Logging

---

# Authentication

JWT is used for authentication.

Passwords are hashed using bcrypt before storage.

Protected routes require a valid access token.

---

# API Structure

Every API request follows

Client Request

↓

Route

↓

Controller

↓

Service

↓

SQLite

↓

Response

---

# Error Handling

The backend returns consistent HTTP responses.

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

500 Internal Server Error

Error messages should be meaningful but never expose sensitive information.

---

# Payment Flow

Donor submits payment

↓

Backend validates request

↓

Payment Provider

↓

Payment Success

↓

Save donation

↓

Create blockchain proof

↓

Return confirmation

Blockchain transactions must never execute before successful payment confirmation.

---

# Blockchain Communication

The backend communicates with smart contracts using Ethers.js.

The frontend never interacts directly with blockchain.

---

# Security

Input Validation

JWT Authentication

Password Hashing

Environment Variables

Role-Based Authorization

SQL Injection Protection

Request Validation

Secure API Responses

---

# Logging

The backend records

- authentication events
- donation events
- campaign events
- administrator activities
- blockchain events
- payment events

These logs assist in monitoring and troubleshooting.

---

# Scalability

The backend is designed to support future enhancements including

- PostgreSQL migration
- AI fraud detection
- Email notifications
- SMS notifications
- Multiple payment providers
- Multi-NGO support