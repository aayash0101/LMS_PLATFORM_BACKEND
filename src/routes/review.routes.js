import express from 'express'
import { protect, authorize } from '../middleware/auth.middleware.js'
import validateRequest from '../middleware/validateRequest.js'
import { createReviewValidator, updateReviewValidator } from '../validators/review.validators.js'
import * as reviewController from '../controllers/review.controller.js'

const router = express.Router({ mergeParams: true }) 

router.get('/', reviewController.getCourseReviews)

router.post(
  '/',
  protect,
  authorize('student'),
  createReviewValidator,
  validateRequest,
  reviewController.createReview
)

router.put(
  '/:id',
  protect,
  updateReviewValidator,
  validateRequest,
  reviewController.updateReview
)

router.delete('/:id', protect, reviewController.deleteReview)

export default router