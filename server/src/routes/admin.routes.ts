import { Router } from 'express'
import {
  audit,
  broadcastNotification,
  dashboard,
  getUser,
  listUsers,
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
router.get('/audit', audit)
router.post('/notifications', broadcastNotification)

export default router
