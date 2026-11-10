import express from 'express'
import cors from 'cors'
import { clerkMiddleware } from '@clerk/express'

import { env, assertRequiredEnv, featureStatus } from './configs/env.js'
import { ensureSchema } from './db/migrate.js'
import aiRouter from './routes/aiRoutes.js'
import userRouter from './routes/userRoutes.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'

assertRequiredEnv()

const app = express()

app.use(
  cors({
    origin: env.allowedOrigins,
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))

// Verifies the Clerk session token and populates req.auth.
// Authorization lives in middlewares/auth.js.
app.use(clerkMiddleware())

app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'ai-forge-api',
    status: 'ok',
    features: featureStatus(),
  })
})

app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)

app.use(notFound)
app.use(errorHandler)

const start = async () => {
  await ensureSchema()
  // Loopback by default - see configs/env.js. Put a proxy or tunnel in front
  // of this rather than widening the bind.
  app.listen(env.port, env.host, () => {
    console.log(`ai-forge API listening on http://${env.host}:${env.port}`)
    const features = featureStatus()
    const disabled = Object.entries(features)
      .filter(([, on]) => !on)
      .map(([name]) => name)
    if (disabled.length) {
      console.warn(
        `Disabled (missing API keys): ${disabled.join(', ')}. See server/.env.example`
      )
    }
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

export default app
