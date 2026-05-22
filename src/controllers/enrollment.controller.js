import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import {
  enrollInCourse,
  getMyEnrollments,
  getEnrollmentDetails,
  markLessonComplete,
  getProgressSummary,
} from '../services/enrollment.service.js'

export const enroll = asyncHandler(async (req, res) => {
  const enrollment = await enrollInCourse(req.user._id, req.params.courseId)

  return successResponse(res, {
    statusCode: 201,
    message: 'Successfully enrolled in course',
    data: { enrollment },
  })
})

export const getMyCourses = asyncHandler(async (req, res) => {
  const enrollments = await getMyEnrollments(req.user._id)

  return successResponse(res, {
    message: 'Enrollments fetched successfully',
    data: { enrollments },
  })
})

export const getDetails = asyncHandler(async (req, res) => {
  const enrollment = await getEnrollmentDetails(
    req.user._id,
    req.params.courseId
  )

  return successResponse(res, {
    message: 'Enrollment details fetched successfully',
    data: { enrollment },
  })
})

export const completeLesson = asyncHandler(async (req, res) => {
  const enrollment = await markLessonComplete(
    req.user._id,
    req.params.courseId,
    req.params.lessonId
  )

  return successResponse(res, {
    message: 'Lesson marked as complete',
    data: {
      completionPercentage: enrollment.completionPercentage,
      isCompleted: enrollment.isCompleted,
    },
  })
})

export const getProgress = asyncHandler(async (req, res) => {
  const progress = await getProgressSummary(req.user._id, req.params.courseId)

  return successResponse(res, {
    message: 'Progress fetched successfully',
    data: { progress },
  })
})