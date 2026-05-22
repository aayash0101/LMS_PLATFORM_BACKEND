import { validationResult } from 'express-validator'
import ApiError from '../utils/ApiError.js'

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }))

    throw new ApiError(400, 'Validation failed', extractedErrors)
  }

  next()
}

export default validateRequest