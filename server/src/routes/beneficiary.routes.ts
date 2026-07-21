import { Router } from 'express'
import {
  create,
  detail,
  detailAdmin,
  list,
  listAdmin,
  remove,
  update,
  uploadImage,
  verify,
} from '../controllers/beneficiary.controller'
import { requireAuth, requireRole } from '../middleware/auth'
import { imageUpload } from '../middleware/upload'

const router = Router()

// Contract: api/beneficiaries.md. Base path: /api/beneficiaries

// Admin (declared first: static/prefixed paths before the public :id route).
router.get('/admin', requireAuth, requireRole('admin'), listAdmin)
router.get('/admin/:id', requireAuth, requireRole('admin'), detailAdmin)
router.post('/upload', requireAuth, requireRole('admin'), imageUpload('beneficiaries').single('image'), uploadImage)
router.post('/', requireAuth, requireRole('admin'), create)
router.put('/:id', requireAuth, requireRole('admin'), update)
router.patch('/:id/verify', requireAuth, requireRole('admin'), verify)
router.delete('/:id', requireAuth, requireRole('admin'), remove)

// Public: verified beneficiaries only.
router.get('/', list)
router.get('/:id', detail)

export default router
