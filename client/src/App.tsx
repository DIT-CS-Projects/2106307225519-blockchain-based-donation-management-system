import { LazyMotion, domAnimation } from 'framer-motion'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { AppRoutes } from '@/router/AppRoutes'

export default function App() {
  return (
    // strict + m.* components keep the motion bundle to the DOM subset.
    <LazyMotion features={domAnimation} strict>
      <ScrollToTop />
      <AppRoutes />
    </LazyMotion>
  )
}
