import { Router } from 'express'
import healthRoutes from './health.routes'
import authRoutes from './auth.routes'
import campaignRoutes from './campaign.routes'
import statsRoutes from './stats.routes'
import contactRoutes from './contact.routes'
import paymentRoutes from './payment.routes'
import donationRoutes from './donation.routes'
import verifyRoutes from './verify.routes'
import notificationRoutes from './notification.routes'
import beneficiaryRoutes from './beneficiary.routes'
import disbursementRoutes from './disbursement.routes'
import adminRoutes from './admin.routes'
import reportRoutes from './report.routes'
import rewardRoutes from './reward.routes'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/campaigns', campaignRoutes)
router.use('/stats', statsRoutes)
router.use('/contact', contactRoutes)
router.use('/payments', paymentRoutes)
router.use('/donations', donationRoutes)
router.use('/verify', verifyRoutes)
router.use('/notifications', notificationRoutes)
router.use('/beneficiaries', beneficiaryRoutes)
router.use('/disbursements', disbursementRoutes)
router.use('/admin', adminRoutes)
router.use('/reports', reportRoutes)
router.use('/rewards', rewardRoutes)

export default router
