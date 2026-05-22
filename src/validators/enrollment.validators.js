import { param } from 'express-validator'
import mongoose from 'mongoose'

export const enrollmentParamValidator = [
  param('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid course ID'),
]

export const lessonProgressValidator = [
  param('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid course ID'),

  param('lessonId')
    .notEmpty()
    .withMessage('Lesson ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid lesson ID'),
]