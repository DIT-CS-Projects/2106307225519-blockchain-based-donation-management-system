import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export function ClosingCtaSection() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center lg:py-32">
        <h2 className="font-display text-4xl font-bold text-balance sm:text-5xl">
          Give with proof<span className="text-accent">.</span>
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Browse verified campaigns, give in minutes with the payment method you
          already use, and hold the receipt forever.
        </p>
        <Button asChild size="lg" className="mt-10">
          <Link to={ROUTES.campaigns}>
            Browse campaigns
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
