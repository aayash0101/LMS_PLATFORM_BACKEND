// src/validators/review.validators.js
import { body } from 'express-validator'

export const createReviewValidator = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
]

export const updateReviewValidator = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
]