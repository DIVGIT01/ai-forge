import express from 'express'

import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  removeImageBackground,
  removeImageObject,
  reviewResume,
} from '../controllers/aiController.js'
import { uploadImage, uploadResume } from '../configs/multer.js'
import {
  requireAuth,
  enforceUsageLimit,
  requirePremium,
} from '../middlewares/auth.js'

const aiRouter = express.Router()

// Every AI route is authenticated. No exceptions.
aiRouter.use(requireAuth)

// Free plan gets a metered allowance of these.
aiRouter.post('/generate-article', enforceUsageLimit, generateArticle)
aiRouter.post('/generate-blog-title', enforceUsageLimit, generateBlogTitle)

// Premium-only: these call paid third-party APIs on every request.
aiRouter.post('/generate-image', requirePremium, generateImage)
aiRouter.post(
  '/remove-image-background',
  requirePremium,
  uploadImage,
  removeImageBackground
)
aiRouter.post(
  '/remove-image-object',
  requirePremium,
  uploadImage,
  removeImageObject
)
aiRouter.post('/resume-review', requirePremium, uploadResume, reviewResume)

export default aiRouter
