import { Router } from 'express'
import {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  getInstructor,
  getDashboard,
} from '../controllers/user.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import { updateProfileValidator } from '../validators/user.validators.js'
import validateRequest from '../middleware/validateRequest.js'
import upload from '../config/multer.js'

const router = Router()

router.get('/instructor/:id', getInstructor)

router.use(protect)

router.get('/profile', getUserProfile)
router.put('/profile', updateProfileValidator, validateRequest, updateUserProfile)
router.post('/avatar', upload.single('avatar'), uploadUserAvatar)
router.get('/dashboard', authorize('student'), getDashboard)

export default router