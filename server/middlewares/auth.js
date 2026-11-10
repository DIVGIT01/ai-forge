import { clerkClient } from '@clerk/express'
import { env } from '../configs/env.js'

/**
 * Gate for every /api route that touches user data.
 *
 * Clerk's `clerkMiddleware()` (wired in server.js) verifies the session JWT and
 * populates `req.auth`. This middleware is the authorization half: it refuses
 * unauthenticated callers and resolves the caller's plan + remaining free
 * usage so controllers can enforce limits.
 *
 * Fails closed: any error resolving the user is a 401/500, never a pass-through.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const auth = typeof req.auth === 'function' ? req.auth() : req.auth
    const userId = auth?.userId

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'Not signed in.' })
    }

    // `has` comes from Clerk Billing and reflects the user's subscription.
    const hasPremiumPlan = Boolean(auth.has?.({ plan: 'premium' }))

    const user = await clerkClient.users.getUser(userId)
    const freeUsage = Number(user.privateMetadata?.free_usage ?? 0)

    req.userId = userId
    req.plan = hasPremiumPlan ? 'premium' : 'free'
    req.freeUsage = hasPremiumPlan ? 0 : freeUsage

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Blocks free-plan users once they exhaust their allowance.
 * Mount on the routes that cost money to serve.
 */
export const enforceUsageLimit = (req, res, next) => {
  if (req.plan === 'premium') return next()

  if (req.freeUsage >= env.freeUsageLimit) {
    return res.status(403).json({
      success: false,
      message:
        'Free usage limit reached. Upgrade to the Premium plan to keep creating.',
    })
  }
  next()
}

/** Premium-only tools (background / object removal, resume review). */
export const requirePremium = (req, res, next) => {
  if (req.plan === 'premium') return next()
  return res.status(403).json({
    success: false,
    message: 'This feature is only available on the Premium plan.',
  })
}

/**
 * Increments the stored free-usage counter after a successful generation.
 * Premium users are never metered.
 */
export const consumeFreeUsage = async (req) => {
  if (req.plan === 'premium') return
  await clerkClient.users.updateUserMetadata(req.userId, {
    privateMetadata: { free_usage: req.freeUsage + 1 },
  })
}
