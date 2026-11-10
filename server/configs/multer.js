import multer from 'multer'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, os.tmpdir()),
  filename: (_req, file, cb) => {
    // Never trust the client-supplied filename for the path we write to.
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10)
    const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : ''
    cb(null, `ai-forge-${crypto.randomUUID()}${safeExt}`)
  },
})

const allow = (mimetypes) => (_req, file, cb) => {
  if (mimetypes.includes(file.mimetype)) return cb(null, true)
  cb(
    new multer.MulterError(
      'LIMIT_UNEXPECTED_FILE',
      `Unsupported file type: ${file.mimetype}`
    )
  )
}

/** Single image upload, field name `image`. */
export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: allow(['image/jpeg', 'image/png', 'image/webp']),
}).single('image')

/** Single PDF upload, field name `resume`. */
export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: allow(['application/pdf']),
}).single('resume')
