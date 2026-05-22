import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import errorHandler from './middleware/errorHandler.js'
import notFound from './middleware/notFound.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'

const app = express()

app.use(helmet())

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.json({ limit: '10mb' }))

app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LMS API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

app.use(notFound)
app.use(errorHandler)

export default app