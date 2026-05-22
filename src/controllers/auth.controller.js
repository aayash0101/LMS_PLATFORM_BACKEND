import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import { sendRefreshTokenCookie } from '../utils/jwt.js'
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from '../services/auth.service.js'

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

  const { user, accessToken, refreshToken } = await registerUser({
    name,
    email,
    password,
    role,
  })

  sendRefreshTokenCookie(res, refreshToken)

  return successResponse(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: { user, accessToken },
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const { user, accessToken, refreshToken } = await loginUser({
    email,
    password,
  })

  sendRefreshTokenCookie(res, refreshToken)

  return successResponse(res, {
    message: 'Login successful',
    data: { user, accessToken },
  })
})

export const logout = asyncHandler(async (req, res) => {
 
  await logoutUser(req.user._id)

  res.clearCookie('refreshToken')

  return successResponse(res, {
    message: 'Logged out successfully',
  })
})

export const me = asyncHandler(async (req, res) => {
  const user = await getMe(req.user._id)

  return successResponse(res, {
    message: 'User fetched successfully',
    data: { user },
  })
})