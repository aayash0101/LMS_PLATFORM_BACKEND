import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    provider: {
      type: String,
      default: 'esewa',
    },
    providerRefId: {
      type: String, 
    },
  },
  { timestamps: true }
)

paymentSchema.index({ student: 1 })
paymentSchema.index({ course: 1 })
paymentSchema.index({ transactionId: 1 })

const Payment = mongoose.model('Payment', paymentSchema)
export default Payment