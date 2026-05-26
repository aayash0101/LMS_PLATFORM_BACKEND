import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema(
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
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    progress: [
      {
        lesson: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson',
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    paymentStatus: {
      type: String,
      enum: ['free', 'paid', 'pending'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
)

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })
enrollmentSchema.index({ student: 1 })
enrollmentSchema.index({ course: 1 })

const Enrollment = mongoose.model('Enrollment', enrollmentSchema)
export default Enrollment