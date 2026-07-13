# BACKEND IMPLEMENTATION GUIDE

## Stack

Express

PostgreSQL

JWT

Axios

bcrypt

Multer

dotenv

---

## Architecture

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Database

Controllers must never contain business logic.

---

## Authentication

JWT

Access Token (short-lived)

Refresh Token (httpOnly cookie, rotated)

Password Hash

bcrypt

Never store plain passwords.

---

## Validation

Validate

Body

Params

Query

Headers

Return proper HTTP status codes.

---

## Database

Access through Drizzle ORM.

Parameterized queries only.

Prevent SQL Injection.

Use transactions when required.

---

## Logging

Log

Errors

Warnings

Security events

Payment callbacks

Blockchain transactions

---

## Security

Helmet

CORS

Rate Limiting

Input Validation

Environment Variables

Never expose secrets.

---

## File Uploads

Validate

Image Type

Image Size

File Name

Store securely.

---

## Error Handling

Central error middleware.

Consistent API responses.

Never leak stack traces.

---

## Performance

Pagination

Indexes

Caching (Future)

Async everywhere.

---

## Testing

Controllers

Services

Routes

Database

Must be independently testable.