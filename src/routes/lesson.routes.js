import { Router } from 'express'
import {
  create,
  update,
  remove,
  uploadVideo,
  getOne,
} from '../controllers/lesson.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import {
  createLessonValidator,
  updateLessonValidator,
} from '../validators/lesson.validators.js'
import validateRequest from '../middleware/validateRequest.js'
import upload from '../config/multer.js'

const router = Router({ mergeParams: true })

router.get('/:lessonId', getOne)

router.use(protect, authorize('instructor', 'admin'))

router.post('/', createLessonValidator, validateRequest, create)
router.put('/:lessonId', updateLessonValidator, validateRequest, update)
router.delete('/:lessonId', remove)
router.post('/:lessonId/video', upload.single('video'), uploadVideo)

export default router