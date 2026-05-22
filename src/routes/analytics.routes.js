import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import * as instructorController from '../controllers/instructor.analytics.controller.js'
import * as adminController from '../controllers/admin.analytics.controller.js'

const router = express.Router()

//  Instructor routes

router.get(
  '/instructor/overview',
  protect,
  authorize('instructor', 'admin'),
  instructorController.getOverview
)

router.get(
  '/instructor/enrollments',
  protect,
  authorize('instructor', 'admin'),
  instructorController.getEnrollmentTimeSeries
)

router.get(
  '/instructor/courses',
  protect,
  authorize('instructor', 'admin'),
  instructorController.getCourseBreakdown
)

router.get(
  '/instructor/lessons/:courseId',
  protect,
  authorize('instructor', 'admin'),
  instructorController.getLessonCompletionRates
)

// Admin-only routes 

router.get(
  '/admin/overview',
  protect,
  authorize('admin'),
  adminController.getOverview
)

router.get(
  '/admin/top-courses',
  protect,
  authorize('admin'),
  adminController.getTopCourses
)

router.get(
  '/admin/recent-activity',
  protect,
  authorize('admin'),
  adminController.getRecentActivity
)

export default router