import { Router } from 'express'
import {
  approveFundraiserApplication,
  audit,
  broadcastNotification,
  dashboard,
  getUser,
  listFundraisers,
  listUsers,
  rejectFundraiserApplication,
  repairProofs,
  updateUserStatus,
} from '../controllers/admin.controller'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

// Contract: api/admin.md. Base path: /api/admin. Admin only throughout.
router.use(requireAuth, requireRole('admin'))

router.get('/dashboard', dashboard)
router.get('/users', listUsers)
router.get('/users/:id', getUser)
router.patch('/users/:id/status', updateUserStatus)

// Fundraisers directory + approval (Decision 024). :id is the application id.
router.get('/fundraisers', listFundraisers)
router.post('/fundraisers/:id/approve', approveFundraiserApplication)
router.post('/fundraisers/:id/reject', rejectFundraiserApplication)

router.get('/audit', audit)
router.post('/notifications', broadcastNotification)

// Re-record donation proofs missing from the current chain.
router.post('/blockchain/repair-proofs', repairProofs)

export default router
