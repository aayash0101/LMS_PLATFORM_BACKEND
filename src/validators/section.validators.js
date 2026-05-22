import { body } from 'express-validator'

export const createSectionValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Section title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description cannot exceed 300 characters'),
]

export const updateSectionValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description cannot exceed 300 characters'),
]

export const reorderSectionsValidator = [
  body('sections')
    .isArray({ min: 1 })
    .withMessage('Sections must be a non-empty array'),

  body('sections.*.sectionId')
    .notEmpty()
    .withMessage('Each section must have a sectionId'),

  body('sections.*.order')
    .isInt({ min: 1 })
    .withMessage('Each section must have a valid order number'),
]