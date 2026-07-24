import { Router } from 'express'
import {
  login,
  logout,
  refresh,
  register,
} from '../controllers/auth.controller'
import {
  applyFundraiser,
  changePassword,
  forgotPassword,
  logoutAll,
  me,
  myFundraiserApplication,
  resetPassword,
  updateProfile,
} from '../controllers/account.controller'
import { requireAuth } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimit'

const router = Router()

// Contract: api/authentication.md. Base path: /api/auth

// Public, rate-limited (docs/SECURITY.md: rate limiting on auth endpoints).
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)

// Refresh rotates the httpOnly cookie; kept under the general limiter so a
// normal SPA session (refresh on load) is not throttled.
router.post('/refresh', refresh)

// Authenticated.
router.post('/logout', requireAuth, logout)
router.post('/logout-all', requireAuth, logoutAll)
router.get('/me', requireAuth, me)
router.put('/profile', requireAuth, updateProfile)
router.put('/change-password', requireAuth, changePassword)

// Become a fundraiser (Decision 020, api/authentication.md).
router.post('/fundraiser-application', requireAuth, applyFundraiser)
router.get('/fundraiser-application', requireAuth, myFundraiserApplication)

export default router
