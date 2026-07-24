import { Router } from 'express'
import {
  create,
  detail,
  detailAdmin,
  detailManaged,
  list,
  listAdmin,
  listManaged,
  remove,
  update,
  uploadImage,
  verify,
} from '../controllers/beneficiary.controller'
import { requireAuth, requireRole } from '../middleware/auth'
import { imageUpload } from '../middleware/upload'

const router = Router()

// Contract: api/beneficiaries.md. Base path: /api/beneficiaries
// Static/prefixed paths are declared before the public :id route.

// Platform-wide (administrator only).
router.get('/admin', requireAuth, requireRole('admin'), listAdmin)
router.get('/admin/:id', requireAuth, requireRole('admin'), detailAdmin)

// Owner surface (fundraiser or administrator; ownership enforced in the service).
router.get('/manage', requireAuth, requireRole('fundraiser', 'admin'), listManaged)
router.get('/manage/:id', requireAuth, requireRole('fundraiser', 'admin'), detailManaged)

router.post(
  '/upload',
  requireAuth,
  requireRole('fundraiser', 'admin'),
  imageUpload('beneficiaries').single('image'),
  uploadImage,
)
router.post('/', requireAuth, requireRole('fundraiser', 'admin'), create)
router.put('/:id', requireAuth, requireRole('fundraiser', 'admin'), update)

// Verification stays administrator only (Decision 020).
router.patch('/:id/verify', requireAuth, requireRole('admin'), verify)

router.delete('/:id', requireAuth, requireRole('fundraiser', 'admin'), remove)

// Public: verified beneficiaries only.
router.get('/', list)
router.get('/:id', detail)

export default router
