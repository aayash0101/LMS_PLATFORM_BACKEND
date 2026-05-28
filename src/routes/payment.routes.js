import { Router } from 'express'
import { initiate, verify } from '../controllers/payment.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/esewa/initiate/:courseId', protect, authorize('student'), initiate)
router.get('/esewa/verify', verify)

export default router