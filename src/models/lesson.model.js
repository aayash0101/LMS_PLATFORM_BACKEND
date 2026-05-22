// src/models/lesson.model.js

import mongoose from 'mongoose'

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    /**
     * Video stored on Cloudinary.
     * public_id needed to delete/replace the video.
     * url is the streaming URL shown to students.
     * duration stored in seconds — frontend formats it.
     */
    video: {
      public_id: String,
      url: String,
      duration: Number,
    },

    /**
     * Downloadable resources attached to the lesson.
     * Embedded array — resources don't exist outside a lesson.
     * WHY embedded? Resources are always fetched with their lesson.
     * No benefit to referencing them separately.
     */
    resources: [
      {
        name: String,
        url: String,
        public_id: String,
        fileType: String,
      },
    ],

    // Order within the section (1-based)
    order: {
      type: Number,
      default: 0,
    },

    // Free preview lessons are visible without enrollment
    isPreview: {
      type: Boolean,
      default: false,
    },

    // Duration in seconds — set after video upload
    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

lessonSchema.index({ section: 1, order: 1 })
lessonSchema.index({ course: 1 })

const Lesson = mongoose.model('Lesson', lessonSchema)

export default Lesson