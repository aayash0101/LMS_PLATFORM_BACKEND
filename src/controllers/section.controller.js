import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import {
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  getCourseSections,
} from '../services/section.service.js'

export const create = asyncHandler(async (req, res) => {
  const section = await createSection(
    req.params.courseId,
    req.user._id,
    req.body
  )

  return successResponse(res, {
    statusCode: 201,
    message: 'Section created successfully',
    data: { section },
  })
})

export const update = asyncHandler(async (req, res) => {
  const section = await updateSection(
    req.params.courseId,
    req.params.sectionId,
    req.user._id,
    req.body
  )

  return successResponse(res, {
    message: 'Section updated successfully',
    data: { section },
  })
})

export const remove = asyncHandler(async (req, res) => {
  await deleteSection(
    req.params.courseId,
    req.params.sectionId,
    req.user._id
  )

  return successResponse(res, {
    message: 'Section deleted successfully',
  })
})

export const reorder = asyncHandler(async (req, res) => {
  const sections = await reorderSections(
    req.params.courseId,
    req.user._id,
    req.body.sections
  )

  return successResponse(res, {
    message: 'Sections reordered successfully',
    data: { sections },
  })
})

export const getSections = asyncHandler(async (req, res) => {
  const sections = await getCourseSections(req.params.courseId)

  return successResponse(res, {
    message: 'Sections fetched successfully',
    data: { sections },
  })
})