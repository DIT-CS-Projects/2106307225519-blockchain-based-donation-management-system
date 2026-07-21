import { Router } from 'express'
import {
  approve,
  balance,
  detail,
  initiate,
  list,
  reject,
} from '../controllers/disbursement.controller'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

// Contract: api/disbursements.md. Base path: /api/disbursements. Admin only throughout.
router.use(requireAuth, requireRole('admin'))

router.get('/', list)
router.post('/', initiate)
router.get('/balance/:campaignId', balance)
router.get('/:id', detail)
router.post('/:id/approve', approve)
router.post('/:id/reject', reject)

export default router
