import multer from 'multer'
import { env } from '../configs/env.js'

/** 404 for anything that did not match a route. */
export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `No route for ${req.method} ${req.originalUrl}` })
}

/**
 * Last-resort error handler.
 *
 * Client-caused problems get a useful message; anything else is logged
 * server-side and reported generically so provider errors and stack traces
 * never leak to the browser.
 */
// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature
export const errorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'That file is too large.'
        : error.field || 'That file could not be accepted.'
    return res.status(400).json({ success: false, message })
  }

  const status =
    error.statusCode || error.status || (error.response?.status >= 400 ? 502 : 500)

  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, error)
  }

  const safeMessage =
    status < 500
      ? error.message
      : 'Something went wrong while processing that request.'

  res.status(status).json({
    success: false,
    message: safeMessage,
    ...(env.nodeEnv === 'development' && status >= 500
      ? { detail: error.message }
      : {}),
  })
}
