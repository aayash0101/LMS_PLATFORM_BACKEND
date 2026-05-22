import User from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/uploadToCloudinary.js'
import Enrollment from '../models/enrollment.model.js'  

export const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('enrolledCourses', 'title thumbnail category')
    .populate('createdCourses', 'title thumbnail isPublished')

  if (!user) throw new ApiError(404, 'User not found')
  return user.toSafeObject()
}

export const updateProfile = async (userId, { name, bio }) => {

  const user = await User.findByIdAndUpdate(
    userId,
    { name, bio },
    { new: true, runValidators: true }
  )

  if (!user) throw new ApiError(404, 'User not found')

  return user.toSafeObject()
}

export const uploadAvatar = async (userId, fileBuffer) => {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id)
  }

  const result = await uploadToCloudinary(
    fileBuffer,
    'lms/avatars',
    {
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      ],
    }
  )

  user.avatar = {
    public_id: result.public_id,
    url: result.secure_url,
  }

  await user.save({ validateBeforeSave: false })

  return user.toSafeObject()
}

export const getInstructorProfile = async (instructorId) => {
  const instructor = await User.findOne({
    _id: instructorId,
    role: 'instructor',
    isActive: true,
  })
  if (!instructor) throw new ApiError(404, 'Instructor not found')
  return {
    _id: instructor._id,
    name: instructor.name,
    bio: instructor.bio,
    avatar: instructor.avatar,
    createdCourses: instructor.createdCourses,
    totalCourses: instructor.createdCourses.length,
  }
}

export const getStudentDashboard = async (userId) => {
  const enrollments = await Enrollment.find({ student: userId })
    .populate({
      path: 'course',
      select: 'title thumbnail category instructor',
      populate: {
        path: 'instructor',
        select: 'name avatar',
      },
    })
    .sort({ updatedAt: -1 })
    .limit(5) // Show 5 most recent

  const totalEnrolled = await Enrollment.countDocuments({ student: userId })
  const completed = await Enrollment.countDocuments({
    student: userId,
    isCompleted: true,
  })

  return {
    totalEnrolled,
    completed,
    inProgress: totalEnrolled - completed,
    recentEnrollments: enrollments,
  }
}