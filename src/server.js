import 'dotenv/config'
import app from './app.js'
import connectDB from './config/database.js'
import cloudinary from './config/cloudinary.js'

console.log('MONGO_URI:', process.env.MONGO_URI)
const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(` Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    console.log(` Health check: http://localhost:${PORT}/api/health`)
  })

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION  Shutting down...')
    console.error(err.name, err.message)
    server.close(() => process.exit(1))
  })

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...')
    server.close(() => console.log('Process terminated.'))
  })
}


startServer()