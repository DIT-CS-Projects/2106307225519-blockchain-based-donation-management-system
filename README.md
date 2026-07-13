# Blockchain-Based NGO Donation Management System

A modern donation management platform built for transparency, trust and accountability.

This project combines modern web technologies with blockchain verification to provide immutable proof of donations while maintaining a simple user experience.

---

## Features

• User Authentication

• Campaign Management

• Donation Processing

• Blockchain Verification

• Beneficiary Management

• Administrator Dashboard

• Donor Dashboard

• Reports

• Notifications

• Audit Logs

---

## Technology Stack

Frontend

React

TypeScript

Vite

Tailwind CSS v4

shadcn/ui

Framer Motion

Backend

Express

TypeScript

PostgreSQL

Drizzle ORM

JWT

Blockchain

Solidity

Hardhat

Ethers.js

Ethereum Sepolia

---

## Project Structure

client/

server/

contracts/

database/

docs/

api/

pages/

flows/

prompts/

---

## Development

Prerequisites: Node.js LTS and a PostgreSQL database (a free Neon instance works).

Client (frontend)

```
cd client
npm install
npm run dev      # http://localhost:5173
```

Server (backend)

```
cd server
npm install
cp .env.example .env   # then set DATABASE_URL and secrets
npm run dev      # http://localhost:4000
```

Contracts (blockchain)

```
cd contracts
npm install
npm run compile
npm test
npm run node             # local chain
npm run deploy:local     # deploy to local chain
```

Each package has its own .env.example. Never commit .env files.

---

## Documentation

Every architectural decision is documented.

Developers should read:

CLAUDE.md

before contributing.

---

## Status

Development in progress.

Version

0.1.0