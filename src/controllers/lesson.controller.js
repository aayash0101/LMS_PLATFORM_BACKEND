import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import ApiError from '../utils/ApiError.js'
import {
  createLesson,
  updateLesson,
  deleteLesson,
  uploadLessonVideo,
  getLessonById,
} from '../services/lesson.service.js'

export const create = asyncHandler(async (req, res) => {
  const lesson = await createLesson(
    req.params.courseId,
    req.params.sectionId,
    req.user._id,
    req.body
  )

  return successResponse(res, {
    statusCode: 201,
    message: 'Lesson created successfully',
    data: { lesson },
  })
})

export const update = asyncHandler(async (req, res) => {
  const lesson = await updateLesson(
    req.params.courseId,
    req.params.sectionId,
    req.params.lessonId,
    req.user._id,
    req.body
  )

  return successResponse(res, {
    message: 'Lesson updated successfully',
    data: { lesson },
  })
})

export const remove = asyncHandler(async (req, res) => {
  await deleteLesson(
    req.params.courseId,
    req.params.sectionId,
    req.params.lessonId,
    req.user._id
  )

  return successResponse(res, {
    message: 'Lesson deleted successfully',
  })
})

export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a video file')
  }

  const lesson = await uploadLessonVideo(
    req.params.courseId,
    req.params.sectionId,
    req.params.lessonId,
    req.user._id,
    req.file.buffer
  )

  return successResponse(res, {
    message: 'Video uploaded successfully',
    data: { lesson },
  })
})

export const getOne = asyncHandler(async (req, res) => {
  const lesson = await getLessonById(
    req.params.courseId,
    req.params.sectionId,
    req.params.lessonId
  )

  return successResponse(res, {
    message: 'Lesson fetched successfully',
    data: { lesson },
  })
})