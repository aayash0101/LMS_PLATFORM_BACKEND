import asyncHandler from '../utils/asyncHandler.js'
import ApiResponse from '../utils/ApiResponse.js'
import { initiatePayment, verifyPayment } from '../services/payment.service.js'

export const initiate = asyncHandler(async (req, res) => {
  const data = await initiatePayment(req.user._id, req.params.courseId)
  res.status(200).json(new ApiResponse(200, data, 'Payment initiated'))
})

export const verify = asyncHandler(async (req, res) => {
  const { data: encodedData, courseId } = req.query
  if (!encodedData) {
    return res.status(400).json(new ApiResponse(400, null, 'Missing payment data'))
  }
  const result = await verifyPayment(req.user._id, encodedData)
  res.status(200).json(new ApiResponse(200, result, 'Payment verified and enrollment activated'))
})