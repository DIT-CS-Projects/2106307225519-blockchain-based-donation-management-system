import rateLimit from 'express-rate-limit'

const FIFTEEN_MINUTES = 15 * 60 * 1000

/** General limiter applied to all /api routes. */
export const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  // Campaign browsing is public, read-only traffic. It must remain available
  // during a payment surge; abuse-sensitive and write endpoints remain under
  // the general limiter (and authentication has its own stricter limiter).
  skip: (req) => req.method === 'GET' && (req.path === '/health' || req.path.startsWith('/campaigns')),
  message: { message: 'Too many requests. Please try again later.' },
})

/** Stricter limiter for authentication endpoints (Decision 013). */
export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
})
