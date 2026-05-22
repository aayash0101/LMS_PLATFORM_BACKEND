import Lesson from '../models/lesson.model.js'
import Section from '../models/section.model.js'
import Course from '../models/course.model.js'
import ApiError from '../utils/ApiError.js'
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/uploadToCloudinary.js'

const verifySectionOwnership = async (courseId, sectionId, instructorId) => {
  const course = await Course.findById(courseId)
  if (!course) throw new ApiError(404, 'Course not found')

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new ApiError(403, 'You are not authorized to modify this course')
  }

  const section = await Section.findOne({ _id: sectionId, course: courseId })
  if (!section) throw new ApiError(404, 'Section not found')

  return { course, section }
}

export const createLesson = async (
  courseId,
  sectionId,
  instructorId,
  lessonData
) => {
  const { section } = await verifySectionOwnership(
    courseId,
    sectionId,
    instructorId
  )

  const lessonCount = await Lesson.countDocuments({ section: sectionId })

  const lesson = await Lesson.create({
    ...lessonData,
    section: sectionId,
    course: courseId,
    order: lessonCount + 1,
  })

  await Section.findByIdAndUpdate(sectionId, {
    $push: { lessons: lesson._id },
  })

  return lesson
}

export const updateLesson = async (
  courseId,
  sectionId,
  lessonId,
  instructorId,
  updateData
) => {
  await verifySectionOwnership(courseId, sectionId, instructorId)

  const lesson = await Lesson.findOneAndUpdate(
    { _id: lessonId, section: sectionId, course: courseId },
    updateData,
    { new: true, runValidators: true }
  )

  if (!lesson) throw new ApiError(404, 'Lesson not found')

  return lesson
}

export const deleteLesson = async (
  courseId,
  sectionId,
  lessonId,
  instructorId
) => {
  await verifySectionOwnership(courseId, sectionId, instructorId)

  const lesson = await Lesson.findOne({
    _id: lessonId,
    section: sectionId,
    course: courseId,
  })

  if (!lesson) throw new ApiError(404, 'Lesson not found')

  if (lesson.video?.public_id) {
    await deleteFromCloudinary(lesson.video.public_id)
  }

  await lesson.deleteOne()

  await Section.findByIdAndUpdate(sectionId, {
    $pull: { lessons: lessonId },
  })
}

export const uploadLessonVideo = async (
  courseId,
  sectionId,
  lessonId,
  instructorId,
  fileBuffer
) => {
  await verifySectionOwnership(courseId, sectionId, instructorId)

  const lesson = await Lesson.findOne({
    _id: lessonId,
    section: sectionId,
    course: courseId,
  })

  if (!lesson) throw new ApiError(404, 'Lesson not found')

  if (lesson.video?.public_id) {
    await deleteFromCloudinary(lesson.video.public_id)
  }

  const result = await uploadToCloudinary(
    fileBuffer,
    'lms/videos',
    {
      resource_type: 'video',
      chunk_size: 6000000, 
    }
  )

  lesson.video = {
    public_id: result.public_id,
    url: result.secure_url,
    duration: Math.round(result.duration || 0),
  }

  lesson.duration = Math.round(result.duration || 0)

  await lesson.save()

  return lesson
}

export const getLessonById = async (courseId, sectionId, lessonId) => {
  const lesson = await Lesson.findOne({
    _id: lessonId,
    section: sectionId,
    course: courseId,
  })

  if (!lesson) throw new ApiError(404, 'Lesson not found')

  return lesson
}