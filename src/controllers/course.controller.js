import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, paginatedResponse } from '../utils/apiResponse.js'
import ApiError from '../utils/ApiError.js'
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  togglePublish,
  uploadThumbnail,
  getInstructorCourses,
} from '../services/course.service.js'

export const create = asyncHandler(async (req, res) => {
  const course = await createCourse(req.user._id, req.body)

  return successResponse(res, {
    statusCode: 201,
    message: 'Course created successfully',
    data: { course },
  })
})

export const getAll = asyncHandler(async (req, res) => {
  const { courses, pagination } = await getAllCourses(req.query)

  return paginatedResponse(res, {
    message: 'Courses fetched successfully',
    data: { courses },
    pagination,
  })
})

export const getMyCourses = asyncHandler(async (req, res) => {
  const { courses, pagination } = await getInstructorCourses(
    req.user._id,
    req.query
  )

  return paginatedResponse(res, {
    message: 'Your courses fetched successfully',
    data: { courses },
    pagination,
  })
})

export const getOne = asyncHandler(async (req, res) => {
  const course = await getCourseById(req.params.id)

  return successResponse(res, {
    message: 'Course fetched successfully',
    data: { course },
  })
})

export const update = asyncHandler(async (req, res) => {
  const course = await updateCourse(req.params.id, req.user._id, req.body)

  return successResponse(res, {
    message: 'Course updated successfully',
    data: { course },
  })
})

export const remove = asyncHandler(async (req, res) => {
  await deleteCourse(req.params.id, req.user._id, req.user.role)

  return successResponse(res, {
    message: 'Course deleted successfully',
  })
})

export const publishToggle = asyncHandler(async (req, res) => {
  const course = await togglePublish(req.params.id, req.user._id)

  return successResponse(res, {
    message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
    data: { course },
  })
})

export const uploadCourseThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file')
  }

  const course = await uploadThumbnail(
    req.params.id,
    req.user._id,
    req.file.buffer
  )

  return successResponse(res, {
    message: 'Thumbnail uploaded successfully',
    data: { course },
  })
})