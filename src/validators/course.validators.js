import { body } from 'express-validator'

export const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn([
      'Web Development', 'Mobile Development', 'Data Science',
      'Machine Learning', 'DevOps', 'Design', 'Business',
      'Marketing', 'Photography', 'Music', 'Other',
    ]).withMessage('Invalid category'),

  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Level must be Beginner, Intermediate or Advanced'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('requirements')
    .optional()
    .isArray().withMessage('Requirements must be an array'),

  body('objectives')
    .optional()
    .isArray().withMessage('Objectives must be an array'),
]

export const updateCourseValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),

  body('category')
    .optional()
    .isIn([
      'Web Development', 'Mobile Development', 'Data Science',
      'Machine Learning', 'DevOps', 'Design', 'Business',
      'Marketing', 'Photography', 'Music', 'Other',
    ]).withMessage('Invalid category'),

  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid level'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
]