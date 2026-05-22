import User from '../models/user.model.js'
import Course from '../models/course.model.js'
import Enrollment from '../models/enrollment.model.js'
import Review from '../models/review.model.js'

export const getAdminOverview = async () => {
  const [
    totalUsers,
    totalInstructors,
    totalStudents,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    revenueStats,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'instructor', isActive: true }),
    User.countDocuments({ role: 'student', isActive: true }),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Enrollment.countDocuments({ paymentStatus: 'completed' }),
    Enrollment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseData',
        },
      },
      { $unwind: '$courseData' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$courseData.price' },
        },
      },
    ]),
  ])

  return {
    totalUsers,
    totalInstructors,
    totalStudents,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalRevenue: Math.round((revenueStats[0]?.totalRevenue ?? 0) * 100) / 100,
  }
}

export const getTopCourses = async (limit = 10) => {
  const courses = await Course.aggregate([
    { $match: { isPublished: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'instructor',
        foreignField: '_id',
        as: 'instructorData',
      },
    },
    { $unwind: '$instructorData' },
    {
      $project: {
        title: 1,
        slug: 1,
        price: 1,
        averageRating: 1,
        totalRatings: 1,
        totalStudents: 1,
        revenue: { $multiply: ['$price', '$totalStudents'] },
        instructor: {
          _id: '$instructorData._id',
          name: '$instructorData.name',
        },
      },
    },
    { $sort: { totalStudents: -1 } },
    { $limit: limit },
  ])

  return courses
}

export const getRecentActivity = async (limit = 10) => {
  const [recentUsers, recentEnrollments] = await Promise.all([
    User.find({ isActive: true })
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(limit),

    Enrollment.find({ paymentStatus: 'completed' })
      .populate('student', 'name email')
      .populate('course', 'title slug')
      .sort({ createdAt: -1 })
      .limit(limit),
  ])

  return { recentUsers, recentEnrollments }
}