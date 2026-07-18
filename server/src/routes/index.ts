import { Router } from 'express'
import healthRoutes from './health.routes'
import authRoutes from './auth.routes'
import campaignRoutes from './campaign.routes'
import statsRoutes from './stats.routes'
import contactRoutes from './contact.routes'
import paymentRoutes from './payment.routes'
import donationRoutes from './donation.routes'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/campaigns', campaignRoutes)
router.use('/stats', statsRoutes)
router.use('/contact', contactRoutes)
router.use('/payments', paymentRoutes)
router.use('/donations', donationRoutes)

// Feature routers are mounted here per stage:
// router.use('/disbursements', disbursementRoutes)
// router.use('/blockchain', blockchainRoutes)

export default router
