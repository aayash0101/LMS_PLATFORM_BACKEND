import Enrollment from '../models/enrollment.model.js'
import Course from '../models/course.model.js'
import Lesson from '../models/lesson.model.js'
import User from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'

export const enrollInCourse = async (studentId, courseId) => {
  const course = await Course.findById(courseId)

  if (!course) throw new ApiError(404, 'Course not found')

  if (!course.isPublished) {
    throw new ApiError(400, 'This course is not available for enrollment')
  }

  if (course.instructor.toString() === studentId.toString()) {
    throw new ApiError(400, 'You cannot enroll in your own course')
  }

  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  })

  if (existingEnrollment) {
    throw new ApiError(409, 'You are already enrolled in this course')
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    paymentStatus: course.isFree ? 'free' : 'paid',
  })

  await Promise.all([
    Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: studentId },
      $inc: { totalStudents: 1 },
    }),

    User.findByIdAndUpdate(studentId, {
      $addToSet: { enrolledCourses: courseId },
    }),
  ])

  return enrollment.populate('course', 'title thumbnail instructor')
}

export const getMyEnrollments = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: 'course',
      select: 'title thumbnail category instructor averageRating totalStudents',
      populate: {
        path: 'instructor',
        select: 'name avatar',
      },
    })
    .sort({ createdAt: -1 })

  return enrollments
}

export const getEnrollmentDetails = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  }).populate({
    path: 'course',
    populate: {
      path: 'sections',
      options: { sort: { order: 1 } },
      populate: {
        path: 'lessons',
        select: 'title duration isPreview order video',
        options: { sort: { order: 1 } },
      },
    },
  })

  if (!enrollment) {
    throw new ApiError(404, 'Enrollment not found. Please enroll in this course first.')
  }

  return enrollment
}

export const markLessonComplete = async (studentId, courseId, lessonId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  })

  if (!enrollment) {
    throw new ApiError(404, 'You are not enrolled in this course')
  }

  const alreadyCompleted = enrollment.progress.some(
    (p) => p.lesson.toString() === lessonId
  )

  if (alreadyCompleted) {
    throw new ApiError(409, 'Lesson already marked as complete')
  }

  const lesson = await Lesson.findOne({ _id: lessonId, course: courseId })
  if (!lesson) {
    throw new ApiError(404, 'Lesson not found in this course')
  }

  enrollment.progress.push({ lesson: lessonId })

  const totalLessons = await Lesson.countDocuments({ course: courseId })

  if (totalLessons > 0) {
    enrollment.completionPercentage = Math.round(
      (enrollment.progress.length / totalLessons) * 100
    )
  }

  if (enrollment.completionPercentage === 100) {
    enrollment.isCompleted = true
    enrollment.completedAt = new Date()
  }

  await enrollment.save()

  return enrollment
}

export const getProgressSummary = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  }).populate('progress.lesson', 'title duration')

  if (!enrollment) {
    throw new ApiError(404, 'You are not enrolled in this course')
  }

  const totalLessons = await Lesson.countDocuments({ course: courseId })
  const completedLessons = enrollment.progress.length

  return {
    completionPercentage: enrollment.completionPercentage,
    completedLessons,
    totalLessons,
    isCompleted: enrollment.isCompleted,
    completedAt: enrollment.completedAt,
    progress: enrollment.progress,
  }
}

export const checkEnrollment = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  })

  return !!enrollment
}