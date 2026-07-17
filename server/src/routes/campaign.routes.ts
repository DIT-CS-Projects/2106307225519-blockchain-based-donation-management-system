import { Router } from 'express'
import { getCampaign, getCampaigns } from '../controllers/campaign.controller'

const router = Router()

// Public. Contract: api/campaigns.md
router.get('/', getCampaigns)
router.get('/:id', getCampaign)

export default router
