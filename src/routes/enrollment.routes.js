import { Router } from 'express'
import {
  enroll,
  getMyCourses,
  getDetails,
  completeLesson,
  getProgress,
} from '../controllers/enrollment.controller.js'
import { protect, authorize } from '../middleware/auth.middleware.js'
import {
  enrollmentParamValidator,
  lessonProgressValidator,
} from '../validators/enrollment.validators.js'
import validateRequest from '../middleware/validateRequest.js'

const router = Router()

router.use(protect)

router.post(
  '/:courseId',
  authorize('student'),
  enrollmentParamValidator,
  validateRequest,
  enroll
)

router.get('/my-courses', getMyCourses)

router.get(
  '/:courseId',
  enrollmentParamValidator,
  validateRequest,
  getDetails
)

router.post(
  '/:courseId/progress/:lessonId',
  authorize('student'),
  lessonProgressValidator,
  validateRequest,
  completeLesson
)

router.get(
  '/:courseId/progress',
  enrollmentParamValidator,
  validateRequest,
  getProgress
)

export default router