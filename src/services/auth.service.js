import User from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/jwt.js'

export const registerUser = async ({ name, email, password, role }) => {
  
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, 'Email already registered')
  }

  const user = await User.create({ name, email, password, role })

  const accessToken = generateAccessToken(user._id, user.role)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  }
}

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated')
  }

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const accessToken = generateAccessToken(user._id, user.role)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
  }
}

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null })
}

export const getMe = async (userId) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  return user.toSafeObject()
}