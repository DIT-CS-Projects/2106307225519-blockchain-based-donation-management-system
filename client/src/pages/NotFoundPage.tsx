import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start px-6 py-24">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Button asChild className="mt-8">
        <Link to={ROUTES.home}>Back to home</Link>
      </Button>
    </section>
  )
}
