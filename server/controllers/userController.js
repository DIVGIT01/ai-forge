import sql from '../configs/db.js'
import { env } from '../configs/env.js'

/** Everything the signed-in user has created, newest first. */
export const getUserCreations = async (req, res, next) => {
  try {
    const creations = await sql`
      SELECT * FROM creations
      WHERE user_id = ${req.userId}
      ORDER BY created_at DESC
    `
    res.json({ success: true, creations })
  } catch (error) {
    next(error)
  }
}

/** The community feed: published images from every user. */
export const getPublishedCreations = async (_req, res, next) => {
  try {
    const creations = await sql`
      SELECT * FROM creations
      WHERE publish = true
      ORDER BY created_at DESC
      LIMIT 100
    `
    res.json({ success: true, creations })
  } catch (error) {
    next(error)
  }
}

/**
 * Like / unlike a published creation.
 *
 * The add and remove are done in SQL rather than read-modify-write so two
 * concurrent likes cannot clobber each other.
 */
export const toggleLikeCreation = async (req, res, next) => {
  try {
    const id = Number(req.body.id)
    if (!Number.isInteger(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'A valid creation id is required.' })
    }

    const [creation] = await sql`
      SELECT id, likes FROM creations WHERE id = ${id} AND publish = true
    `
    if (!creation) {
      return res
        .status(404)
        .json({ success: false, message: 'Creation not found.' })
    }

    const alreadyLiked = (creation.likes || []).includes(req.userId)

    const [updated] = alreadyLiked
      ? await sql`
          UPDATE creations
          SET likes = array_remove(likes, ${req.userId}), updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `
      : await sql`
          UPDATE creations
          SET likes = array_append(likes, ${req.userId}), updated_at = NOW()
          WHERE id = ${id} AND NOT (${req.userId} = ANY(likes))
          RETURNING *
        `

    res.json({
      success: true,
      message: alreadyLiked ? 'Creation unliked.' : 'Creation liked.',
      creation: updated ?? creation,
    })
  } catch (error) {
    next(error)
  }
}

/** Powers the dashboard plan card and the usage meter. */
export const getUsage = async (req, res, next) => {
  try {
    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM creations WHERE user_id = ${req.userId}
    `
    res.json({
      success: true,
      plan: req.plan,
      free_usage: req.freeUsage,
      free_usage_limit: env.freeUsageLimit,
      total_creations: count,
    })
  } catch (error) {
    next(error)
  }
}

/** Publish or unpublish one of your own creations. */
export const togglePublishCreation = async (req, res, next) => {
  try {
    const id = Number(req.body.id)
    if (!Number.isInteger(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'A valid creation id is required.' })
    }

    const [updated] = await sql`
      UPDATE creations
      SET publish = NOT publish, updated_at = NOW()
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING *
    `
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'Creation not found.' })
    }

    res.json({ success: true, creation: updated })
  } catch (error) {
    next(error)
  }
}

/** Delete one of your own creations. */
export const deleteCreation = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'A valid creation id is required.' })
    }

    const [deleted] = await sql`
      DELETE FROM creations
      WHERE id = ${id} AND user_id = ${req.userId}
      RETURNING id
    `
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: 'Creation not found.' })
    }

    res.json({ success: true, message: 'Creation deleted.' })
  } catch (error) {
    next(error)
  }
}
