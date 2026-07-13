# Project Structure

This document defines the standard directory structure of the application.

```
ngo-donation-system/

client/
server/
contracts/

docs/
api/
database/
flows/
pages/
prompts/
testing/
deployment/

```

---

# Client

Contains the React frontend.

Major folders

* assets
* components
* context
* hooks
* layouts
* pages
* routes
* services
* styles
* utils

---

# Server

Contains Express backend.

Major folders

* config
* controllers
* database
* middleware
* repositories
* routes
* services
* utils

---

# Contracts

Contains Solidity smart contracts.

* TransparencyRegistry.sol
* deployment scripts
* Hardhat configuration

---

# Documentation

Project knowledge.

Should always remain synchronized with implementation.

---

# Development Rule

Every new feature should update

* Documentation
* API
* Database
* Tests

before implementation is considered complete.
