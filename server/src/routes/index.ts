import { Router } from 'express'
import healthRoutes from './health.routes'

const router = Router()

router.use('/health', healthRoutes)

// Feature routers are mounted here per stage:
// router.use('/auth', authRoutes)
// router.use('/campaigns', campaignRoutes)
// router.use('/payments', paymentRoutes)
// router.use('/donations', donationRoutes)
// router.use('/disbursements', disbursementRoutes)
// router.use('/blockchain', blockchainRoutes)

export default router
