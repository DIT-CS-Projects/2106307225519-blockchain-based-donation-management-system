# FRONTEND ARCHITECTURE

## Overview

The frontend is responsible for providing a modern, responsive and premium user experience.

The interface follows a component-based architecture built using React.

---

# Framework

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

---

# Design Philosophy

The UI should follow the craftsmanship of modern fintech products.

Design inspiration:

- Revolut
- Stripe
- Linear
- Notion

Characteristics

- Premium spacing
- Minimal interfaces
- Smooth animations
- Clean typography
- Reusable components
- Responsive layouts

---

# Folder Structure

src/

assets/

components/

layouts/

pages/

routes/

hooks/

context/

services/

utils/

styles/

constants/

---

# Components

Components must be reusable.

Avoid duplicated UI.

Common reusable components include

- Buttons
- Inputs
- Cards
- Tables
- Modals
- Sidebar
- Navbar
- Toasts
- Progress Bars
- Badges

---

# Layouts

Public Layout

Used for

- Home
- Campaigns
- About
- Contact

Includes

- Navbar
- Footer

---

Dashboard Layout

Used for authenticated users.

Includes

- Sidebar
- Top Navigation
- Notifications
- Profile Menu

---

Authentication Layout

Used for

- Login
- Register
- Forgot Password

---

# Routing

React Router manages navigation.

Public Routes

- Home
- Campaigns
- Campaign Details
- Login
- Register

Protected Routes

- Dashboard
- Admin
- Reports
- Beneficiaries
- Profile

---

# State Management

React Context is used for:

- Authentication
- Theme
- Notifications

Local component state is used whenever global state is unnecessary.

---

# API Communication

Axios communicates with the backend.

The frontend never communicates directly with blockchain.

All requests pass through the Express backend.

---

# Responsiveness

The application supports

Desktop

Tablet

Mobile

Layouts should adapt gracefully across all screen sizes.

---

# Accessibility

Every page should include

- keyboard navigation
- semantic HTML
- readable typography
- accessible buttons
- accessible forms