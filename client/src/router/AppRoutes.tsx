import { Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'

/** Central route table. Public, auth, and dashboard routes are added per stage. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}
