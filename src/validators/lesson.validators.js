import { body } from 'express-validator'

export const createLessonValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Lesson title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('isPreview')
    .optional()
    .isBoolean()
    .withMessage('isPreview must be true or false'),
]

export const updateLessonValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('isPreview')
    .optional()
    .isBoolean()
    .withMessage('isPreview must be true or false'),
]