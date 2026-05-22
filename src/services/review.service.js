import Review from '../models/review.model.js'
import Course from '../models/course.model.js'
import Enrollment from '../models/enrollment.model.js'
import ApiError from '../utils/ApiError.js'
import { getPagination, getPaginationMeta } from '../utils/pagination.js'

const recalculateCourseRating = async (courseId) => {
  const result = await Review.aggregate([
    { $match: { course: courseId } },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
      },
    },
  ])

  if (result.length === 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: 0,
      totalRatings: 0,
    })
  } else {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10, 
      totalRatings: result[0].totalRatings,
    })
  }
}

export const createReview = async (courseId, studentId, { rating, comment }) => {
  const course = await Course.findById(courseId)
  if (!course) throw new ApiError(404, 'Course not found')
  if (!course.isPublished) throw new ApiError(400, 'Cannot review an unpublished course')

  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId })
  if (!enrollment) throw new ApiError(403, 'You must be enrolled in this course to leave a review')

  const review = await Review.create({ student: studentId, course: courseId, rating, comment })

  await recalculateCourseRating(course._id)

  return review.populate('student', 'name avatar')
}

export const getCourseReviews = async (courseId, query) => {
  const course = await Course.findById(courseId)
  if (!course) throw new ApiError(404, 'Course not found')

  const { page, limit, skip } = getPagination(query)

  const [reviews, total] = await Promise.all([
    Review.find({ course: courseId })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ course: courseId }),
  ])

  return { reviews, pagination: getPaginationMeta(total, page, limit) }
}

export const updateReview = async (reviewId, studentId, updates) => {
  const review = await Review.findById(reviewId)
  if (!review) throw new ApiError(404, 'Review not found')

  if (review.student.toString() !== studentId.toString()) {
    throw new ApiError(403, 'You can only edit your own reviews')
  }

  if (updates.rating !== undefined) review.rating = updates.rating
  if (updates.comment !== undefined) review.comment = updates.comment
  await review.save()

  await recalculateCourseRating(review.course)

  return review.populate('student', 'name avatar')
}

export const deleteReview = async (reviewId, userId, userRole) => {
  const review = await Review.findById(reviewId)
  if (!review) throw new ApiError(404, 'Review not found')

  const isOwner = review.student.toString() === userId.toString()
  const isAdmin = userRole === 'admin'

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to delete this review')
  }

  const courseId = review.course
  await review.deleteOne()

  await recalculateCourseRating(courseId)
}