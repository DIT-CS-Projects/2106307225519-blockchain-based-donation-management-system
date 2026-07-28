import { Router } from 'express'
import { overview } from '../controllers/reward.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Base path: /api/rewards. Any authenticated user can read their own points.
router.use(requireAuth)

router.get('/', overview)

export default router
