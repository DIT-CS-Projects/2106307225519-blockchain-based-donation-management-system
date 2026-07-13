import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { env } from './config/env'
import { apiLimiter } from './middleware/rateLimit'
import routes from './routes'
import { notFound } from './middleware/notFound'
import { errorHandler } from './middleware/errorHandler'

/** Build and configure the Express application. */
export function createApp(): Express {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'))
  }

  app.use('/api', apiLimiter, routes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
