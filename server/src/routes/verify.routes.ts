import { Router } from 'express'
import { verifyReceipt } from '../controllers/verify.controller'

const router = Router()

// Contract: pages/public-verification.md. Base path: /api/verify. Public,
// no authentication — the receipt number is the lookup key by design.
router.get('/:receiptNumber', verifyReceipt)

export default router
