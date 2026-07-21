import { Router } from 'express'
import {
  deleteCampaignHandler,
  getCampaign,
  getCampaignAdminDetail,
  getCampaigns,
  getCampaignsAdmin,
  patchArchiveCampaign,
  postCampaign,
  putCampaign,
  uploadCampaignImage,
} from '../controllers/campaign.controller'
import { requireAuth, requireRole } from '../middleware/auth'
import { imageUpload } from '../middleware/upload'

const router = Router()

// Contract: api/campaigns.md

// Admin (declared before the public :id route so 'admin' never matches as an id).
router.get('/admin', requireAuth, requireRole('admin'), getCampaignsAdmin)
router.get('/admin/:id', requireAuth, requireRole('admin'), getCampaignAdminDetail)
router.post('/', requireAuth, requireRole('admin'), postCampaign)
router.post(
  '/upload',
  requireAuth,
  requireRole('admin'),
  imageUpload('campaigns').single('image'),
  uploadCampaignImage,
)
router.put('/:id', requireAuth, requireRole('admin'), putCampaign)
router.patch('/:id/archive', requireAuth, requireRole('admin'), patchArchiveCampaign)
router.delete('/:id', requireAuth, requireRole('admin'), deleteCampaignHandler)

// Public.
router.get('/', getCampaigns)
router.get('/:id', getCampaign)

export default router
