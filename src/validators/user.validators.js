import { body } from 'express-validator'

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio cannot exceed 200 characters'),

  body('role')
    .not()
    .exists()
    .withMessage('Role cannot be updated through this endpoint'),

  body('email')
    .not()
    .exists()
    .withMessage('Email cannot be updated through this endpoint'),
]