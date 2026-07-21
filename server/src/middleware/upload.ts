import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { ApiError } from '../utils/ApiError'

// api/campaigns.md: Upload Campaign Image — jpg, jpeg, png, webp; size-limited.
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}
const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB

const UPLOAD_ROOT = path.resolve(__dirname, '../../uploads')

function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

/**
 * Build an image-upload middleware scoped to a subfolder (e.g. 'campaigns').
 * Filenames are never trusted: each upload gets a random name with an
 * extension derived from the validated MIME type, never the client-supplied
 * filename (docs/SECURITY.md: rename files safely, prevent executable uploads).
 */
export function imageUpload(subfolder: string) {
  const dir = path.join(UPLOAD_ROOT, subfolder)

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir(dir)
      cb(null, dir)
    },
    filename: (_req, file, cb) => {
      const ext = ALLOWED_MIME_TYPES[file.mimetype] ?? ''
      cb(null, `${randomUUID()}${ext}`)
    },
  })

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME_TYPES[file.mimetype]) {
        cb(ApiError.badRequest('Only JPG, PNG, and WEBP images are allowed'))
        return
      }
      cb(null, true)
    },
  })
}

/** Public URL path for a file stored under a given upload subfolder. */
export function uploadedFileUrl(subfolder: string, filename: string): string {
  return `/uploads/${subfolder}/${filename}`
}
