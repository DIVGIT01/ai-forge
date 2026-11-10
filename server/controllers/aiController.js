import fs from 'node:fs/promises'
import axios from 'axios'
import FormData from 'form-data'
import pdf from 'pdf-parse/lib/pdf-parse.js'

import sql from '../configs/db.js'
import cloudinary from '../configs/cloudinary.js'
import { generateText } from '../configs/ai.js'
import { env, cloudinaryConfigured } from '../configs/env.js'
import { consumeFreeUsage } from '../middlewares/auth.js'

/** Persist a creation and hand the saved row back to the caller. */
const saveCreation = async ({ userId, prompt, content, type, publish = false }) => {
  const [creation] = await sql`
    INSERT INTO creations (user_id, prompt, content, type, publish)
    VALUES (${userId}, ${prompt}, ${content}, ${type}, ${publish})
    RETURNING *
  `
  return creation
}

const removeTempFile = async (filePath) => {
  if (!filePath) return
  await fs.rm(filePath, { force: true }).catch(() => {})
}

const requireCloudinary = () => {
  if (!cloudinaryConfigured()) {
    throw Object.assign(
      new Error('Image processing is not configured on this server.'),
      { statusCode: 503 }
    )
  }
}

// ---------------------------------------------------------------- text tools

export const generateArticle = async (req, res, next) => {
  try {
    const { prompt, length } = req.body
    if (!prompt?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'A topic is required.' })
    }

    const wordTarget = Number(length) || 800
    const content = await generateText(
      `Write a well-structured, engaging article in Markdown about "${prompt}". ` +
        `Aim for roughly ${wordTarget} words. Use headings, short paragraphs and ` +
        `bullet lists where they help. Do not wrap the response in a code fence.`,
      { maxTokens: Math.min(Math.ceil(wordTarget * 2), 4000) }
    )

    const creation = await saveCreation({
      userId: req.userId,
      prompt,
      content,
      type: 'article',
    })
    await consumeFreeUsage(req)

    res.json({ success: true, content, creation })
  } catch (error) {
    next(error)
  }
}

export const generateBlogTitle = async (req, res, next) => {
  try {
    const { prompt, category } = req.body
    if (!prompt?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'A keyword is required.' })
    }

    const content = await generateText(
      `Generate 10 catchy blog title ideas for the keyword "${prompt}" in the ` +
        `"${category || 'General'}" category. Return them as a Markdown list, ` +
        `no preamble and no explanation.`,
      { maxTokens: 500 }
    )

    const creation = await saveCreation({
      userId: req.userId,
      prompt: `Blog titles for "${prompt}" (${category || 'General'})`,
      content,
      type: 'blog-title',
    })
    await consumeFreeUsage(req)

    res.json({ success: true, content, creation })
  } catch (error) {
    next(error)
  }
}

// --------------------------------------------------------------- image tools

export const generateImage = async (req, res, next) => {
  try {
    requireCloudinary()
    if (!env.clipdropApiKey) {
      return res.status(503).json({
        success: false,
        message: 'Image generation is not configured on this server.',
      })
    }

    const { prompt, style, publish } = req.body
    if (!prompt?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'A description is required.' })
    }

    const fullPrompt = `${prompt}${style ? `, in the style of ${style}` : ''}`

    const form = new FormData()
    form.append('prompt', fullPrompt)

    const { data } = await axios.post(
      'https://clipdrop-api.co/text-to-image/v1',
      form,
      {
        headers: { ...form.getHeaders(), 'x-api-key': env.clipdropApiKey },
        responseType: 'arraybuffer',
        timeout: 120_000,
      }
    )

    const base64Image = `data:image/png;base64,${Buffer.from(data).toString('base64')}`
    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: 'ai-forge/generated',
    })

    const creation = await saveCreation({
      userId: req.userId,
      prompt: fullPrompt,
      content: secure_url,
      type: 'image',
      publish: publish === true || publish === 'true',
    })

    res.json({ success: true, content: secure_url, creation })
  } catch (error) {
    next(error)
  }
}

export const removeImageBackground = async (req, res, next) => {
  try {
    requireCloudinary()
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'An image file is required.' })
    }

    const { public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ai-forge/uploads',
    })

    // Cloudinary applies the AI background removal when the derived URL is
    // first requested, so the transformation is baked into the URL itself.
    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: 'background_removal' }],
      resource_type: 'image',
      format: 'png',
    })

    const creation = await saveCreation({
      userId: req.userId,
      prompt: 'Remove background from image',
      content: imageUrl,
      type: 'image',
    })

    res.json({ success: true, content: imageUrl, creation })
  } catch (error) {
    next(error)
  } finally {
    await removeTempFile(req.file?.path)
  }
}

export const removeImageObject = async (req, res, next) => {
  try {
    requireCloudinary()
    const { object } = req.body
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'An image file is required.' })
    }
    if (!object?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Describe the object you want removed.',
      })
    }
    if (object.trim().split(/\s+/).length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Please describe the object in a single word.',
      })
    }

    const { public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ai-forge/uploads',
    })

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object.trim()}` }],
      resource_type: 'image',
    })

    const creation = await saveCreation({
      userId: req.userId,
      prompt: `Remove ${object.trim()} from image`,
      content: imageUrl,
      type: 'image',
    })

    res.json({ success: true, content: imageUrl, creation })
  } catch (error) {
    next(error)
  } finally {
    await removeTempFile(req.file?.path)
  }
}

// -------------------------------------------------------------------- resume

export const reviewResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'A PDF resume is required.' })
    }

    const buffer = await fs.readFile(req.file.path)
    const parsed = await pdf(buffer)
    const resumeText = parsed.text?.trim()

    if (!resumeText) {
      return res.status(422).json({
        success: false,
        message: 'No readable text found in that PDF.',
      })
    }

    const content = await generateText(
      'You are an experienced technical recruiter. Review the resume below and ' +
        'reply in Markdown with these sections: Overall Impression, Strengths, ' +
        'Weaknesses, Missing Keywords, and Concrete Improvements. Be specific ' +
        'and actionable.\n\nResume:\n\n' +
        resumeText.slice(0, 20_000),
      { maxTokens: 2000 }
    )

    const creation = await saveCreation({
      userId: req.userId,
      prompt: `Review of ${req.file.originalname}`,
      content,
      type: 'resume-review',
    })

    res.json({ success: true, content, creation })
  } catch (error) {
    next(error)
  } finally {
    await removeTempFile(req.file?.path)
  }
}
