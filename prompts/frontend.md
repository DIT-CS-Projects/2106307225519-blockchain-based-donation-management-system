# FRONTEND IMPLEMENTATION GUIDE

## Purpose

This document defines how every frontend feature must be implemented.

Claude must follow these rules for every React component.

---

## Framework

React

Vite

React Router

TailwindCSS v4

shadcn/ui

Framer Motion

Axios

React Hook Form

Lucide Icons

---

## Design Philosophy

Inspired by

• Revolut

• Stripe Dashboard

• Notion

Minimal

Elegant

Fast

Professional

No unnecessary decoration.

---

## Component Rules

Every component must have one responsibility.

Avoid large components.

Split reusable UI.

Maximum preferred size

200 lines.

---

## Folder Rules

pages/

Only page composition.

No business logic.

---

components/

Reusable UI only.

---

services/

API communication.

---

hooks/

Custom hooks.

---

context/

Global state.

---

utils/

Pure helper functions.

---

constants/

Configuration.

---

## Styling

Tailwind first.

Never write inline styles.

Avoid CSS files unless absolutely necessary.

Use theme tokens.

---

## State

Local State

↓

Context

↓

Server

Never duplicate state.

---

## Forms

Always

React Hook Form

Validation

Client

Server

Both.

---

## API

Never call fetch directly.

Always use Axios service layer.

---

## Loading

Every request

Loading State

Skeleton

Spinner

Disable Buttons

---

## Error Handling

Never expose raw backend errors.

Always convert to user-friendly messages.

---

## Accessibility

Keyboard navigation.

Proper labels.

ARIA support.

Focus management.

---

## Responsive

Desktop First

Tablet

Mobile

All pages must work on all devices.

---

## Animation

Framer Motion only.

Animations should be subtle.

Duration

200–350ms

Avoid distracting effects.

---

## Code Quality

Readable code.

Meaningful variable names.

Small reusable components.

No duplicated logic.

Comment only when necessary.