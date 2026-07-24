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

// Contract: api/disbursements.md. Base path: /api/disbursements.
// Campaign owners (fundraisers) and administrators; ownership is enforced in
// the service. Approval stays administrator-only (Decision 020).
router.use(requireAuth)

const ownerOrAdmin = requireRole('fundraiser', 'admin')

router.get('/', ownerOrAdmin, list)
router.post('/', ownerOrAdmin, initiate)
router.get('/balance/:campaignId', ownerOrAdmin, balance)
router.get('/:id', ownerOrAdmin, detail)
router.post('/:id/approve', requireRole('admin'), approve)
router.post('/:id/reject', requireRole('admin'), reject)

export default router
