import { Router } from 'express'
import { getStats } from '../controllers/stats.controller'

const router = Router()

// Public. Contract: pages/landing-page.md (GET /stats)
router.get('/', getStats)

export default router
