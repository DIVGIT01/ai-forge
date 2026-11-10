import express from 'express'

import {
  getUserCreations,
  getPublishedCreations,
  toggleLikeCreation,
  togglePublishCreation,
  deleteCreation,
  getUsage,
} from '../controllers/userController.js'
import { requireAuth } from '../middlewares/auth.js'

const userRouter = express.Router()

// Every user route is authenticated. No exceptions.
userRouter.use(requireAuth)

userRouter.get('/usage', getUsage)
userRouter.get('/get-user-creations', getUserCreations)
userRouter.get('/get-published-creations', getPublishedCreations)
userRouter.post('/toggle-like-creation', toggleLikeCreation)
userRouter.post('/toggle-publish-creation', togglePublishCreation)
userRouter.delete('/creations/:id', deleteCreation)

export default userRouter
