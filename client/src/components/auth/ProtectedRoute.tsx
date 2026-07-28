import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, homeForRole } from '@/constants/routes'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import type { UserRole } from '@/services/auth'

interface ProtectedRouteProps {
  /** When set, the user must hold one of these roles (RBAC). */
  roles?: UserRole[]
}

/**
 * Guards nested routes. Waits out the initial session check, sends anonymous
 * users to login (remembering where they were headed), and enforces role
 * access (docs/SECURITY.md: authentication, role, permission).
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <LoadingScreen label="Checking your session" />
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  return <Outlet />
}
