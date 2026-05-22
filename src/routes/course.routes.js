import { Router } from 'express'
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  publishToggle,
  uploadCourseThumbnail,
  getMyCourses,
} from '../controllers/course.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import {
  createCourseValidator,
  updateCourseValidator,
} from '../validators/course.validators.js'
import validateRequest from '../middleware/validateRequest.js'
import upload from '../config/multer.js'

const router = Router()

router.get('/', getAll)
router.get('/:id', getOne)

router.use(protect)

router.post(
  '/',
  authorize('instructor', 'admin'),
  createCourseValidator,
  validateRequest,
  create
)

router.get(
  '/instructor/my-courses',
  authorize('instructor', 'admin'),
  getMyCourses
)

router.put(
  '/:id',
  authorize('instructor', 'admin'),
  updateCourseValidator,
  validateRequest,
  update
)

router.delete('/:id', authorize('instructor', 'admin'), remove)

router.put('/:id/publish', authorize('instructor', 'admin'), publishToggle)

router.post(
  '/:id/thumbnail',
  authorize('instructor', 'admin'),
  upload.single('thumbnail'),
  uploadCourseThumbnail
)

export default router