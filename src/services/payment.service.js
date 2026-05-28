import crypto from 'crypto'
import Payment from '../models/payment.model.js'
import Course from '../models/course.model.js'
import Enrollment from '../models/enrollment.model.js'
import User from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'

const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST'
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q'
const ESEWA_PAYMENT_URL = process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const generateSignature = (message) => {
  return crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64')
}

export const initiatePayment = async (studentId, courseId) => {
  const course = await Course.findById(courseId)
  if (!course) throw new ApiError(404, 'Course not found')
  if (!course.isPublished) throw new ApiError(400, 'Course is not available')
  if (course.isFree) throw new ApiError(400, 'This course is free — enroll directly')

  if (course.instructor.toString() === studentId.toString()) {
    throw new ApiError(400, 'You cannot enroll in your own course')
  }

  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  })
  if (existingEnrollment) throw new ApiError(409, 'Already enrolled in this course')

  const amount = course.price
  const transactionId = `LMS-${studentId}-${courseId}-${Date.now()}`

  const signatureMessage = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${ESEWA_MERCHANT_CODE}`
  const signature = generateSignature(signatureMessage)

  await Payment.create({
    student: studentId,
    course: courseId,
    amount,
    transactionId,
    status: 'pending',
  })

  return {
    amount,
    transactionId,
    signature,
    merchantCode: ESEWA_MERCHANT_CODE,
    paymentUrl: ESEWA_PAYMENT_URL,
    successUrl: `${FRONTEND_URL}/payment/verify?courseId=${courseId}&`,
    failureUrl: `${FRONTEND_URL}/courses/${course.slug}?payment=failed`,
    courseTitle: course.title,
  }
}

export const verifyPayment = async (encodedData) => {
  let decoded
  try {
    decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'))
  } catch {
    throw new ApiError(400, 'Invalid payment response from eSewa')
  }

  console.log('Decoded:', decoded)

  const {
    transaction_uuid: transactionId,
    status,
    transaction_code: providerRefId,
    signed_field_names,
    signature: receivedSignature,
  } = decoded

  // Verify HMAC signature — cryptographically proves payment came from eSewa
  const signatureMessage = signed_field_names
    .split(',')
    .map((field) => `${field}=${decoded[field]}`)
    .join(',')

  const expectedSignature = generateSignature(signatureMessage)
  console.log('Signature match:', expectedSignature === receivedSignature)

  if (expectedSignature !== receivedSignature) {
    throw new ApiError(400, 'Payment signature verification failed')
  }

  if (status !== 'COMPLETE') {
    throw new ApiError(400, `Payment not completed. Status: ${status}`)
  }

  const payment = await Payment.findOne({ transactionId })
  if (!payment) throw new ApiError(404, 'Payment record not found')
  if (payment.status === 'completed') throw new ApiError(409, 'Payment already processed')

  // studentId from our own DB — not from the request
  const studentId = payment.student
  const courseId = payment.course

  console.log('Signature verified — proceeding with enrollment')

  payment.status = 'completed'
  payment.providerRefId = providerRefId
  await payment.save()

  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  })

  if (!existingEnrollment) {
    await Enrollment.create({
      student: studentId,
      course: courseId,
      paymentStatus: 'paid',
      payment: payment._id,
    })

    await Promise.all([
      Course.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledStudents: studentId },
        $inc: { totalStudents: 1 },
      }),
      User.findByIdAndUpdate(studentId, {
        $addToSet: { enrolledCourses: courseId },
      }),
    ])
  }

  return { courseId, paymentId: payment._id }
}