import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

export const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,           
        ...options,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )

    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return
  await cloudinary.uploader.destroy(publicId)
}