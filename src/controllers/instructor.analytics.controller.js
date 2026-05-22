import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import * as analyticsService from '../services/instructor.analytics.service.js'

export const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getInstructorOverview(req.user._id)
  successResponse(res, { message: 'Instructor overview fetched', data })
})

export const getEnrollmentTimeSeries = asyncHandler(async (req, res) => {
  const data = await analyticsService.getEnrollmentTimeSeries(
    req.user._id,
    req.query.period
  )
  successResponse(res, { message: 'Enrollment time series fetched', data })
})

export const getCourseBreakdown = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCourseBreakdown(req.user._id)
  successResponse(res, { message: 'Course breakdown fetched', data })
})

export const getLessonCompletionRates = asyncHandler(async (req, res) => {
  const data = await analyticsService.getLessonCompletionRates(
    req.user._id,
    req.params.courseId
  )
  successResponse(res, { message: 'Lesson completion rates fetched', data })
})