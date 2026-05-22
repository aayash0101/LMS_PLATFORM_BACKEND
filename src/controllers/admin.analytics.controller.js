import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import * as analyticsService from '../services/admin.analytics.service.js'

export const getOverview = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdminOverview()
  successResponse(res, { message: 'Platform overview fetched', data })
})

export const getTopCourses = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const data = await analyticsService.getTopCourses(limit)
  successResponse(res, { message: 'Top courses fetched', data })
})

export const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
  const data = await analyticsService.getRecentActivity(limit)
  successResponse(res, { message: 'Recent activity fetched', data })
})