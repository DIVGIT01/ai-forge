import 'dotenv/config'

/**
 * Central place for reading configuration out of the environment.
 *
 * Anything the server cannot safely guess is read here so a misconfigured
 * deployment fails loudly at boot instead of halfway through a request.
 */

const required = [
  'DATABASE_URL',
  'CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
]

export const env = {
  // Bind to loopback by default. Only widen this deliberately, and put a
  // reverse proxy / tunnel in front of it when you do.
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',

  databaseUrl: process.env.DATABASE_URL,

  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,

  // Comma separated list of browser origins allowed to call this API.
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl:
      process.env.GEMINI_BASE_URL ||
      'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  },

  clipdropApiKey: process.env.CLIPDROP_API_KEY,

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Free-tier allowance before a premium plan is required.
  freeUsageLimit: Number(process.env.FREE_USAGE_LIMIT || 10),
}

export const assertRequiredEnv = () => {
  const missing = required.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy server/.env.example to server/.env and fill it in.'
    )
  }
}

/** Features that degrade gracefully rather than blocking boot. */
export const featureStatus = () => ({
  text: Boolean(env.gemini.apiKey),
  imageGeneration: Boolean(env.clipdropApiKey) && cloudinaryConfigured(),
  imageEditing: cloudinaryConfigured(),
})

export const cloudinaryConfigured = () =>
  Boolean(
    env.cloudinary.cloudName &&
      env.cloudinary.apiKey &&
      env.cloudinary.apiSecret
  )
