import { Router } from 'express'
import {
  beneficiaries,
  blockchain,
  campaigns,
  disbursements,
  donations,
} from '../controllers/report.controller'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

// Contract: api/reports.md. Base path: /api/reports. Admin only.
router.use(requireAuth, requireRole('admin'))

router.get('/donations', donations)
router.get('/campaigns', campaigns)
router.get('/beneficiaries', beneficiaries)
router.get('/disbursements', disbursements)
router.get('/blockchain', blockchain)

export default router
