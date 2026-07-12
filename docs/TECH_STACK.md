# Technology Stack

## Purpose

This document defines the official technology stack for the Blockchain-Based NGO Donation Management System.

Only technologies listed here should be used unless a documented architectural decision approves a change.

---

# Design Philosophy

The project prioritizes:

* Stability over novelty
* Simplicity over unnecessary complexity
* Maintainability
* Scalability
* Security
* Professional user experience

Whenever multiple technologies can solve the same problem, choose the simplest solution that meets the project's requirements.

---

# Frontend

## Framework

React

Reason

* Mature ecosystem
* Component-based architecture
* Excellent community support
* Industry standard
* Compatible with Vite

---

## Build Tool

Vite

Reason

* Extremely fast development server
* Fast production builds
* Excellent React support

---

## Styling

Tailwind CSS

Reason

* Utility-first styling
* Consistent design
* Small production bundle
* Rapid UI development

---

## UI Components

shadcn/ui

Reason

* Accessible components
* Easily customizable
* Works perfectly with Tailwind CSS
* Modern design

---

## Icons

Lucide React

Reason

* Lightweight
* Consistent style
* Tree-shakeable

---

## Animations

Framer Motion

Reason

* Smooth animations
* Production-ready
* Excellent React integration

---

## Routing

React Router

Reason

* Industry standard
* Nested layouts
* Protected routes
* Dynamic routing

---

## HTTP Client

Axios

Reason

* Clean API
* Request interceptors
* Error handling
* Token support

---

## Form Management

React Hook Form

Reason

* High performance
* Easy validation
* Minimal re-rendering

---

## Notifications

React Hot Toast

Reason

* Lightweight
* Modern appearance
* Excellent user experience

---

# Backend

## Runtime

Node.js (LTS)

Reason

* Stable
* Large ecosystem
* JavaScript throughout the stack

---

## Framework

Express.js

Reason

* Lightweight
* Flexible
* Mature
* Excellent middleware support

---

## Authentication

JWT (JSON Web Tokens)

Reason

* Stateless authentication
* Secure API communication
* Industry standard

Passwords should be hashed using **bcrypt**.

---

## Validation

Express middleware with schema validation.

Reason

* Prevent invalid requests
* Improve security
* Consistent API behavior

---

# Database

## Database Engine

SQLite

Reason

* Serverless
* Easy deployment
* Minimal maintenance
* Excellent for a Final Year Project
* Reliable for moderate workloads

SQLite is the **single source of truth** for all operational data.

---

# Blockchain

## Platform

Ethereum

Reason

* Mature ecosystem
* Strong tooling
* Smart contract support

---

## Smart Contract Language

Solidity

Reason

* Native Ethereum language
* Industry standard

---

## Development Framework

Hardhat

Reason

* Smart contract compilation
* Local blockchain
* Testing
* Deployment scripts

---

## Blockchain Library

Ethers.js

Reason

* Official modern Ethereum library
* Active development
* Excellent documentation

---

# Payment Integration

The application shall support Tanzanian payment methods.

Supported methods include:

* M-Pesa
* Airtel Money
* Tigo Pesa
* HaloPesa
* Tanzanian Commercial Banks

The backend communicates with the selected payment gateway API.

Users never interact directly with blockchain wallets.

---

# Email Service

SMTP-compatible email provider.

Purpose

* Password reset
* Registration confirmation
* Donation receipt
* System notifications

---

# File Storage

Initial Version

* Local server storage

Future

* AWS S3
* Cloudflare R2

---

# Version Control

Git

Hosted on

GitHub

Reason

* Collaboration
* Version history
* Backup
* CI/CD readiness

---

# Development Environment

Operating System

Windows 11

IDE

Visual Studio Code

Terminal

PowerShell

Package Manager

npm

---

# Recommended Stable Versions

Node.js

Current Active LTS

React

Stable Release

Express.js

Stable Release

Tailwind CSS

Stable Release

SQLite

Latest Stable Release

Hardhat

Latest Stable Release

Ethers.js

Latest Stable Release

Avoid beta, alpha, release candidate (RC), or experimental versions unless explicitly required.

---

# External Services

* Tanzanian Payment Gateway
* Ethereum Network
* GitHub
* SMTP Email Service

Future Integrations

* AI Fraud Detection
* Analytics Dashboard
* SMS Notifications

---

# Technology Principles

The project follows these engineering principles:

* Prefer stable technologies over newly released alternatives.
* Minimize external dependencies.
* Keep business logic inside the backend.
* Store operational data in SQLite.
* Store immutable donation proofs on Ethereum.
* Keep blockchain interactions transparent to end users.
* Prioritize security and maintainability over premature optimization.

Any proposed technology change must be reviewed against the project's architecture, business requirements, and long-term maintainability before adoption.
