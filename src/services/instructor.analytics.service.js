import mongoose from 'mongoose'
import Course from '../models/course.model.js'
import Enrollment from '../models/enrollment.model.js'
import Review from '../models/review.model.js'
import Lesson from '../models/lesson.model.js'
import ApiError from '../utils/ApiError.js'

const periodToDate = (period = '30d') => {
  const map = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const days = map[period] ?? 30
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export const getInstructorOverview = async (instructorId) => {
  const instructorObjId = new mongoose.Types.ObjectId(instructorId)

  const courses = await Course.find({ instructor: instructorObjId }, '_id')
  const courseIds = courses.map((c) => c._id)

  if (courseIds.length === 0) {
    return {
      totalCourses: 0,
      publishedCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      averageRating: 0,
    }
  }

  const [enrollmentStats, courseStats] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: courseIds }, paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
        },
      },
    ]),
    Course.aggregate([
      { $match: { instructor: instructorObjId } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          publishedCourses: { $sum: { $cond: ['$isPublished', 1, 0] } },
          totalRevenue: {
            $sum: { $multiply: ['$price', '$totalStudents'] },
          },
          averageRating: { $avg: '$averageRating' },
        },
      },
    ]),
  ])

  const es = enrollmentStats[0] ?? { totalStudents: 0 }
  const cs = courseStats[0] ?? {
    totalCourses: 0,
    publishedCourses: 0,
    totalRevenue: 0,
    averageRating: 0,
  }

  return {
    totalCourses: cs.totalCourses,
    publishedCourses: cs.publishedCourses,
    totalStudents: es.totalStudents,
    totalRevenue: Math.round(cs.totalRevenue * 100) / 100,
    averageRating: Math.round((cs.averageRating ?? 0) * 10) / 10,
  }
}

export const getEnrollmentTimeSeries = async (instructorId, period) => {
  const instructorObjId = new mongoose.Types.ObjectId(instructorId)
  const since = periodToDate(period)

  const courses = await Course.find({ instructor: instructorObjId }, '_id')
  const courseIds = courses.map((c) => c._id)

  if (courseIds.length === 0) return []

  const data = await Enrollment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        paymentStatus: 'completed',
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day',
              },
            },
          },
        },
        count: 1,
      },
    },
  ])

  return data
}


export const getCourseBreakdown = async (instructorId) => {
  const instructorObjId = new mongoose.Types.ObjectId(instructorId)

  const courses = await Course.aggregate([
    { $match: { instructor: instructorObjId } },
    {
      $lookup: {
        from: 'enrollments',
        let: { courseId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$course', '$$courseId'] },
                  { $eq: ['$paymentStatus', 'completed'] },
                ],
              },
            },
          },
        ],
        as: 'enrollments',
      },
    },
    {
      $project: {
        title: 1,
        slug: 1,
        isPublished: 1,
        price: 1,
        averageRating: 1,
        totalRatings: 1,
        totalStudents: { $size: '$enrollments' },
        revenue: { $multiply: ['$price', { $size: '$enrollments' }] },
        completedStudents: {
          $size: {
            $filter: {
              input: '$enrollments',
              as: 'e',
              cond: { $eq: ['$$e.isCompleted', true] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        completionRate: {
          $cond: [
            { $gt: ['$totalStudents', 0] },
            {
              $round: [
                { $multiply: [{ $divide: ['$completedStudents', '$totalStudents'] }, 100] },
                1,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { totalStudents: -1 } },
  ])

  return courses
}

export const getLessonCompletionRates = async (instructorId, courseId) => {
  const instructorObjId = new mongoose.Types.ObjectId(instructorId)
  const courseObjId = new mongoose.Types.ObjectId(courseId)

  const course = await Course.findOne({ _id: courseObjId, instructor: instructorObjId })
  if (!course) throw new ApiError(403, 'Course not found or not owned by you')

  const totalEnrolled = await Enrollment.countDocuments({
    course: courseObjId,
    paymentStatus: 'completed',
  })

  if (totalEnrolled === 0) return { totalEnrolled: 0, lessons: [] }

  const lessons = await Lesson.aggregate([
    { $match: { course: courseObjId } },
    { $sort: { order: 1 } },
    {
      $lookup: {
        from: 'enrollments',
        let: { lessonId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$course', courseObjId] } } },
          {
            $project: {
              completed: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: '$progress',
                        as: 'p',
                        cond: { $eq: ['$$p.lesson', '$$lessonId'] },
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          { $match: { completed: true } },
        ],
        as: 'completions',
      },
    },
    {
      $project: {
        title: 1,
        order: 1,
        duration: 1,
        isPreview: 1,
        completedCount: { $size: '$completions' },
        completionRate: {
          $round: [
            {
              $multiply: [{ $divide: [{ $size: '$completions' }, totalEnrolled] }, 100],
            },
            1,
          ],
        },
      },
    },
  ])

  return { totalEnrolled, lessons }
}