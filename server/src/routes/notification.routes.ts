import { Router } from 'express'
import { list, markAllRead, markRead, remove } from '../controllers/notification.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Contract: api/notifications.md. Base path: /api/notifications. Own notifications only.
router.use(requireAuth)

router.get('/', list)
router.put('/read-all', markAllRead)
router.put('/:id/read', markRead)
router.delete('/:id', remove)

export default router
