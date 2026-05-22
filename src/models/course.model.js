import mongoose from 'mongoose'
import { slugify } from '../utils/slugify.js'

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, 'Course description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    thumbnail: {
      public_id: String,
      url: String,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'Machine Learning',
        'DevOps',
        'Design',
        'Business',
        'Marketing',
        'Photography',
        'Music',
        'Other',
      ],
    },

    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      },
    ],

    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    totalStudents: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    requirements: [String],   
    objectives: [String],     
    tags: [String],

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: Date,
  },
  {
    timestamps: true,
    
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)


courseSchema.index({ slug: 1 })
courseSchema.index({ instructor: 1 })
courseSchema.index({ category: 1 })
courseSchema.index({ isPublished: 1 })
courseSchema.index({ averageRating: -1 })
courseSchema.index({ createdAt: -1 })

courseSchema.index({ title: 'text', description: 'text' })

courseSchema.pre('save', function (next) {
  if (this.isNew) {
    this.slug = slugify(this.title)
  }

  this.isFree = this.price === 0

  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date()
  }

  next()
})

courseSchema.virtual('totalSections').get(function () {
  return this.sections?.length || 0
})

const Course = mongoose.model('Course', courseSchema)

export default Course