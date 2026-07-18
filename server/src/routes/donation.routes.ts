import { Router } from 'express'
import {
  detail,
  history,
  receipt,
  statistics,
  summary,
  verify,
} from '../controllers/donation.controller'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

// Contract: api/donations.md. Base path: /api/donations. All routes require auth.
router.use(requireAuth)

// Static paths first so they are not captured by the :id parameter.
router.get('/history', history)
router.get('/summary', summary)
router.get('/statistics', requireRole('admin'), statistics)

router.get('/:id', detail)
router.get('/:id/receipt', receipt)
router.get('/:id/verify', verify)

export default router
