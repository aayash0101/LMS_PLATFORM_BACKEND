import Section from '../models/section.model.js'
import Lesson from '../models/lesson.model.js'
import Course from '../models/course.model.js'
import ApiError from '../utils/ApiError.js'

const verifyCourseOwnership = async (courseId, instructorId) => {
  const course = await Course.findById(courseId)

  if (!course) throw new ApiError(404, 'Course not found')

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new ApiError(403, 'You are not authorized to modify this course')
  }

  return course
}

export const createSection = async (courseId, instructorId, sectionData) => {
  await verifyCourseOwnership(courseId, instructorId)

  const sectionCount = await Section.countDocuments({ course: courseId })

  const section = await Section.create({
    ...sectionData,
    course: courseId,
    order: sectionCount + 1,
  })

  await Course.findByIdAndUpdate(courseId, {
    $push: { sections: section._id },
  })

  return section
}

export const updateSection = async (courseId, sectionId, instructorId, updateData) => {
  await verifyCourseOwnership(courseId, instructorId)

  const section = await Section.findOneAndUpdate(
    { _id: sectionId, course: courseId },
    updateData,
    { new: true, runValidators: true }
  )

  if (!section) throw new ApiError(404, 'Section not found')

  return section
}
export const deleteSection = async (courseId, sectionId, instructorId) => {
  await verifyCourseOwnership(courseId, instructorId)

  const section = await Section.findOne({ _id: sectionId, course: courseId })

  if (!section) throw new ApiError(404, 'Section not found')

  await Lesson.deleteMany({ section: sectionId })

  await section.deleteOne()

  await Course.findByIdAndUpdate(courseId, {
    $pull: { sections: sectionId },
  })
}

export const reorderSections = async (courseId, instructorId, sectionsOrder) => {

  await verifyCourseOwnership(courseId, instructorId)

  await Promise.all(
    sectionsOrder.map(({ sectionId, order }) =>
      Section.findByIdAndUpdate(sectionId, { order })
    )
  )

  const sections = await Section.find({ course: courseId })
    .sort({ order: 1 })
    .populate('lessons', 'title duration isPreview order')

  return sections
}

export const getCourseSections = async (courseId) => {
  const sections = await Section.find({ course: courseId })
    .sort({ order: 1 })
    .populate({
      path: 'lessons',
      select: 'title duration isPreview order video',
      options: { sort: { order: 1 } },
    })

  return sections
}