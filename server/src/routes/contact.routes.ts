import { Router } from 'express'
import { postContactMessage } from '../controllers/contact.controller'

const router = Router()

// Public. Contract: api/contact (message intake).
router.post('/', postContactMessage)

export default router
