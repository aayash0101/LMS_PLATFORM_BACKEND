// src/controllers/user.controller.js

import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getInstructorProfile,
  getStudentDashboard,
} from '../services/user.service.js'

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getProfile(req.user._id)

  return successResponse(res, {
    message: 'Profile fetched successfully',
    data: { user },
  })
})

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, bio } = req.body
  const user = await updateProfile(req.user._id, { name, bio })

  return successResponse(res, {
    message: 'Profile updated successfully',
    data: { user },
  })
})

export const uploadUserAvatar = asyncHandler(async (req, res) => {
 
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file')
  }

  const user = await uploadAvatar(req.user._id, req.file.buffer)

  return successResponse(res, {
    message: 'Avatar uploaded successfully',
    data: { user },
  })
})

export const getInstructor = asyncHandler(async (req, res) => {
  const instructor = await getInstructorProfile(req.params.id)

  return successResponse(res, {
    message: 'Instructor profile fetched successfully',
    data: { instructor },
  })
})

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getStudentDashboard(req.user._id)

  return successResponse(res, {
    message: 'Dashboard data fetched successfully',
    data: { dashboard },
  })
})