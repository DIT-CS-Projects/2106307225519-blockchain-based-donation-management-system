import type { UserRow } from '../database/schema'

/** The authenticated principal attached to the request by requireAuth. */
export interface AuthUser {
  id: number
  role: UserRow['role']
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}
