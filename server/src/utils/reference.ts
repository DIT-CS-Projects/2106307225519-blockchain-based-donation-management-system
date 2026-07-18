import { randomBytes, randomUUID } from 'node:crypto'

// Unambiguous alphabet (no 0/O/1/I) for human-readable codes.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

/** A short, uppercase, collision-resistant code of the given length. */
function shortCode(length: number): string {
  const bytes = randomBytes(length)
  let code = ''
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return code
}

/** Human-facing reference like `CHG-2026-7Q4K9F2P`. Unique per payment. */
export function generateReference(prefix: string): string {
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${shortCode(8)}`
}

/** Receipt number like `RCP-2026-A7F3K9`. */
export function generateReceiptNumber(prefix: string): string {
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${shortCode(6)}`
}

/** Opaque capability token embedded in a checkout URL. */
export function generateCheckoutToken(): string {
  return randomUUID().replace(/-/g, '')
}
