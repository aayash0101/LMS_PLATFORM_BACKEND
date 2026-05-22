// src/routes/auth.routes.js

import { Router } from 'express'
import { register, login, logout, me } from '../controllers/auth.controller.js'
import { registerValidator, loginValidator } from '../validators/auth.validators.js'
import validateRequest from '../middleware/validateRequest.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/register', registerValidator, validateRequest, register)
router.post('/login', loginValidator, validateRequest, login)

router.post('/logout', protect, logout)
router.get('/me', protect, me)

export default router