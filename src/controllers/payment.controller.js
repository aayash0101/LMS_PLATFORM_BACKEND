import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { initiatePayment, verifyPayment } from '../services/payment.service.js'

export const initiate = asyncHandler(async (req, res) => {
  const data = await initiatePayment(req.user._id, req.params.courseId)
  return successResponse(res, { message: 'Payment initiated', data })
})

export const verify = asyncHandler(async (req, res) => {
  const { data: encodedData } = req.query
  if (!encodedData) {
    return errorResponse(res, { message: 'Missing payment data', statusCode: 400 })
  }
  const result = await verifyPayment(encodedData)  // no req.user._id needed
  return successResponse(res, { message: 'Payment verified and enrollment activated', data: result })
})