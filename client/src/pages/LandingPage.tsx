import { ShieldCheck, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { APP_TAGLINE } from '@/constants/config'

/**
 * Placeholder landing page — replaced by the full Stage 2 landing page.
 * Navbar and Footer come from PublicLayout.
 */
export function LandingPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
        <ShieldCheck className="size-4" />
        Blockchain-verified donations
      </span>

      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
        Transparent giving,
        <br />
        verified forever.
      </h1>

      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        {APP_TAGLINE} Donate to verified NGO campaigns with familiar Tanzanian payment
        methods — every shilling recorded immutably on-chain.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link to={ROUTES.campaigns}>
            Browse campaigns
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link to={ROUTES.about}>How verification works</Link>
        </Button>
      </div>
    </section>
  )
}
