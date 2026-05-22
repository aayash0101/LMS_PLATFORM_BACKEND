import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, paginatedResponse } from '../utils/apiResponse.js'
import * as reviewService from '../services/review.service.js'

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(
    req.params.courseId,
    req.user._id,
    req.body
  )
  successResponse(res, { message: 'Review submitted', data: review, statusCode: 201 })
})

export const getCourseReviews = asyncHandler(async (req, res) => {
  const { reviews, pagination } = await reviewService.getCourseReviews(
    req.params.courseId,
    req.query
  )
  paginatedResponse(res, { message: 'Reviews fetched', data: reviews, pagination })
})

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.params.id,
    req.user._id,
    req.body
  )
  successResponse(res, { message: 'Review updated', data: review })
})

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user._id, req.user.role)
  successResponse(res, { message: 'Review deleted' })
})