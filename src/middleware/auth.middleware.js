// src/middleware/auth.middleware.js

import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import { verifyAccessToken } from '../utils/jwt.js'
import User from '../models/user.model.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. No token provided.')
  }

  const decoded = verifyAccessToken(token)

  const user = await User.findById(decoded.id)

  if (!user) {
    throw new ApiError(401, 'User no longer exists.')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated.')
  }

  req.user = user
  next()
})

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not authorized to access this route`
      )
    }
    next()
  }
}