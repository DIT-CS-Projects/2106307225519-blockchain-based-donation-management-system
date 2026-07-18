import { Router } from 'express'
import { callback, createSession, status } from '../controllers/payment.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Contract: api/payment.md. Base path: /api/payments

// A donor opens a checkout session for a campaign.
router.post('/create-session', requireAuth, createSession)

// Provider callback (flows/payment-flow.md). Public: gateways do not send our
// JWT. Authenticity is verified inside the payment service per provider.
router.post('/callback', callback)

// Status of a payment, scoped to the owning donor.
router.get('/status/:reference', requireAuth, status)

export default router
