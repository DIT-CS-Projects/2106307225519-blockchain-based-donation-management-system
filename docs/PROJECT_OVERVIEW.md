# Project Overview

## Project Title

**Blockchain-Based NGO Donation Management System**

---

# Introduction

The Blockchain-Based NGO Donation Management System is a modern web platform designed to improve transparency, accountability, and trust in charitable donations. Traditional donation systems often lack transparency, making it difficult for donors to verify how their contributions are used. This project addresses these challenges by integrating blockchain technology with a user-friendly donation platform.

The system enables donors to contribute to verified fundraising campaigns using Tanzanian mobile money services and bank payments. Every successful donation generates a blockchain transaction that serves as an immutable proof of payment, ensuring that donation records cannot be altered or deleted.

Unlike cryptocurrency-based donation platforms, this system hides blockchain complexity from users. Donors pay using familiar local payment methods while the backend securely handles blockchain interactions.

---

# Project Objectives

* Increase transparency in NGO fundraising.
* Build donor confidence through blockchain verification.
* Support Tanzanian mobile money and banking payments.
* Simplify donation tracking.
* Provide administrators with efficient campaign management tools.
* Create a secure, scalable, and production-ready web application.

---

# Target Users

## Donors

Individuals or organizations contributing to fundraising campaigns.

### Capabilities

* Register and login
* Browse campaigns
* Donate using mobile money or bank
* Download donation receipts
* View donation history
* Track campaign progress
* Apply to become a fundraiser

---

## Fundraisers

Verified donors who run their own campaigns (Decision 020).

### Capabilities

* Everything a donor can do
* Create and manage their own campaigns (each goes live after administrator review)
* Add beneficiaries to their own campaigns (an administrator verifies them)
* Initiate payouts to verified beneficiaries up to the self-serve allowance
* Track activity and reports scoped to their own campaigns

---

## Administrators

Neutral platform operators responsible for overseeing the platform.

### Capabilities

* Approve or reject fundraiser applications
* Review, approve, or reject fundraiser campaigns
* Manage campaigns
* Verify beneficiaries
* Review donations
* Disburse funds and approve payouts above the self-serve allowance
* Generate reports
* Monitor blockchain transactions
* Manage users, including promoting a user to administrator

---

# Core Features

* User authentication
* Campaign management
* Beneficiary management
* Donation processing
* Fund disbursement with dual approval
* Mobile payment integration
* Blockchain verification
* Notifications
* Reporting dashboard
* Profile management
* Responsive design

---

# Technology Stack

Frontend

* React
* Vite
* Tailwind CSS
* shadcn/ui

Backend

* Node.js
* Express.js

Database

* PostgreSQL

Blockchain

* Ethereum
* Hardhat
* Solidity
* Ethers.js

Payment Gateway

* Tanzanian Mobile Money & Banking Gateway

Version Control

* Git
* GitHub

---

# Project Philosophy

The platform should prioritize simplicity, trust, security, and excellent user experience. Blockchain should work silently in the background while users enjoy a familiar payment process.

Every engineering decision should improve maintainability, scalability, and long-term reliability.
