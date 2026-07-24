import { Router } from 'express'
import {
  deleteCampaignHandler,
  getCampaign,
  getCampaignAdminDetail,
  getCampaigns,
  getCampaignsAdmin,
  getManagedCampaignDetail,
  getMyCampaigns,
  patchArchiveCampaign,
  postApproveCampaign,
  postCampaign,
  postRejectCampaign,
  postSubmitCampaign,
  putCampaign,
  uploadCampaignImage,
} from '../controllers/campaign.controller'
import { requireAuth, requireRole } from '../middleware/auth'
import { imageUpload } from '../middleware/upload'

const router = Router()

// Contract: api/campaigns.md. Literal segments are declared before the public
// :id route so 'admin' / 'mine' / 'manage' never match as an id.

// Platform-wide (administrator only).
router.get('/admin', requireAuth, requireRole('admin'), getCampaignsAdmin)
router.get('/admin/:id', requireAuth, requireRole('admin'), getCampaignAdminDetail)

// Owner surface (fundraiser or administrator; ownership enforced in the service).
router.get('/mine', requireAuth, requireRole('fundraiser', 'admin'), getMyCampaigns)
router.get('/manage/:id', requireAuth, requireRole('fundraiser', 'admin'), getManagedCampaignDetail)

router.post('/', requireAuth, requireRole('fundraiser', 'admin'), postCampaign)
router.post(
  '/upload',
  requireAuth,
  requireRole('fundraiser', 'admin'),
  imageUpload('campaigns').single('image'),
  uploadCampaignImage,
)
router.post('/:id/submit', requireAuth, requireRole('fundraiser', 'admin'), postSubmitCampaign)

// Review actions (administrator only).
router.post('/:id/approve', requireAuth, requireRole('admin'), postApproveCampaign)
router.post('/:id/reject', requireAuth, requireRole('admin'), postRejectCampaign)

router.put('/:id', requireAuth, requireRole('fundraiser', 'admin'), putCampaign)
router.patch('/:id/archive', requireAuth, requireRole('fundraiser', 'admin'), patchArchiveCampaign)
router.delete('/:id', requireAuth, requireRole('fundraiser', 'admin'), deleteCampaignHandler)

// Public.
router.get('/', getCampaigns)
router.get('/:id', getCampaign)

export default router
