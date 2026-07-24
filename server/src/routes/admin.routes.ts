import { Router } from 'express'
import {
  approveFundraiserApplication,
  audit,
  broadcastNotification,
  dashboard,
  getUser,
  listFundraiserApplications,
  listUsers,
  promoteUser,
  rejectFundraiserApplication,
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
router.post('/users/:id/promote', promoteUser)

// Fundraiser applications (Decision 020).
router.get('/fundraiser-applications', listFundraiserApplications)
router.post('/fundraiser-applications/:id/approve', approveFundraiserApplication)
router.post('/fundraiser-applications/:id/reject', rejectFundraiserApplication)

router.get('/audit', audit)
router.post('/notifications', broadcastNotification)

export default router
