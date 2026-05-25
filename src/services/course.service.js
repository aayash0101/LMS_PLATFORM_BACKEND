import Course from '../models/course.model.js'
import User from '../models/user.model.js'
import mongoose from 'mongoose'
import ApiError from '../utils/ApiError.js'
import { getPagination, getPaginationMeta } from '../utils/pagination.js'
import { slugify, generateUniqueSlug } from '../utils/slugify.js'
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/uploadToCloudinary.js'

export const createCourse = async (instructorId, courseData) => {
  const baseSlug = slugify(courseData.title)
  const existingCourse = await Course.findOne({ slug: baseSlug })
  if (existingCourse) {
    courseData.slug = generateUniqueSlug(courseData.title)
  }

  const course = await Course.create({
    ...courseData,
    instructor: instructorId,
  })

  await User.findByIdAndUpdate(instructorId, {
    $push: { createdCourses: course._id },
  })

  return course
}

export const getAllCourses = async (query) => {
  const { page, limit, skip } = getPagination(query)
  const filter = { isPublished: true }

  if (query.category) {
    filter.category = query.category
  }

  if (query.level) {
    filter.level = query.level
  }

  if (query.isFree !== undefined) {
    filter.isFree = query.isFree === 'true'
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {}
    if (query.minPrice) filter.price.$gte = Number(query.minPrice)
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice)
  }

  // ✅ Regex search — supports partial/prefix matching as you type
  const searchTerm = query.search?.trim()
  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } },
    ]
  }

  let sort = { createdAt: -1 }
  if (query.sort === 'rating') sort = { averageRating: -1 }
  if (query.sort === 'popular') sort = { totalStudents: -1 }
  if (query.sort === 'price-low') sort = { price: 1 }
  if (query.sort === 'price-high') sort = { price: -1 }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'name avatar')
      .select('-sections -enrolledStudents')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ])

  return {
    courses,
    pagination: getPaginationMeta(total, page, limit),
  }
}

export const getCourseById = async (idOrSlug) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug)

  const course = await Course.findOne(
    isObjectId ? { _id: idOrSlug } : { slug: idOrSlug }
  )
    .populate('instructor', 'name avatar bio')
    .populate({
      path: 'sections',
      populate: {
        path: 'lessons',
        select: 'title description duration isPreview video order',
      },
    })

  if (!course) throw new ApiError(404, 'Course not found')
  return course
}

export const updateCourse = async (courseId, instructorId, updateData) => {
  const course = await Course.findById(courseId)

  if (!course) throw new ApiError(404, 'Course not found')

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new ApiError(403, 'You are not authorized to update this course')
  }

  if (updateData.title && updateData.title !== course.title) {
    const newSlug = slugify(updateData.title)
    const existing = await Course.findOne({
      slug: newSlug,
      _id: { $ne: courseId },
    })
    updateData.slug = existing ? generateUniqueSlug(updateData.title) : newSlug
  }

  const updated = await Course.findByIdAndUpdate(
    courseId,
    updateData,
    { new: true, runValidators: true }
  ).populate('instructor', 'name avatar')

  return updated
}

export const deleteCourse = async (courseId, instructorId, userRole) => {
  const course = await Course.findById(courseId)

  if (!course) throw new ApiError(404, 'Course not found')

  if (
    userRole !== 'admin' &&
    course.instructor.toString() !== instructorId.toString()
  ) {
    throw new ApiError(403, 'You are not authorized to delete this course')
  }

  if (course.thumbnail?.public_id) {
    await deleteFromCloudinary(course.thumbnail.public_id)
  }

  await course.deleteOne()

  await User.findByIdAndUpdate(course.instructor, {
    $pull: { createdCourses: courseId },
  })
}

export const togglePublish = async (courseId, instructorId) => {
  const course = await Course.findById(courseId)

  if (!course) throw new ApiError(404, 'Course not found')

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new ApiError(403, 'You are not authorized to publish this course')
  }

  if (!course.isPublished && course.sections.length === 0) {
    throw new ApiError(400, 'Cannot publish a course with no sections')
  }

  course.isPublished = !course.isPublished

  if (course.isPublished && !course.publishedAt) {
    course.publishedAt = new Date()
  }

  await course.save({ validateBeforeSave: false })

  return course
}

export const uploadThumbnail = async (courseId, instructorId, fileBuffer) => {
  const course = await Course.findById(courseId)

  if (!course) throw new ApiError(404, 'Course not found')

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new ApiError(403, 'You are not authorized to update this course')
  }

  if (course.thumbnail?.public_id) {
    await deleteFromCloudinary(course.thumbnail.public_id)
  }

  const result = await uploadToCloudinary(
    fileBuffer,
    'lms/thumbnails',
    {
      transformation: [
        { width: 1280, height: 720, crop: 'fill' },
      ],
    }
  )

  course.thumbnail = {
    public_id: result.public_id,
    url: result.secure_url,
  }

  await course.save({ validateBeforeSave: false })

  return course
}

export const getInstructorCourses = async (instructorId, query) => {
  const { page, limit, skip } = getPagination(query)

  const filter = { instructor: instructorId }

  if (query.isPublished !== undefined) {
    filter.isPublished = query.isPublished === 'true'
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ])

  return {
    courses,
    pagination: getPaginationMeta(total, page, limit),
  }
}