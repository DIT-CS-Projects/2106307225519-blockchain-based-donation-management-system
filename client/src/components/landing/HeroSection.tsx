import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { m, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { HeroReceipt } from '@/components/landing/HeroReceipt'
import { ROUTES, SECTION_IDS } from '@/constants/routes'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  const reduceMotion = useReducedMotion()

  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE_OUT },
        }

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16 lg:pb-28 lg:pt-24">
      <div className="flex flex-col items-start">
        <m.span
          {...enter(0)}
          className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          <ShieldCheck className="size-4" aria-hidden="true" />
          Every donation independently verifiable
        </m.span>

        <m.h1
          {...enter(0.08)}
          className="mt-6 font-display text-[clamp(3rem,6vw,3.75rem)] font-bold leading-[1.1] text-balance"
        >
          Transparent giving, verified forever.
        </m.h1>

        <m.p {...enter(0.16)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Give to verified campaigns with M-Pesa, Tigo Pesa, Airtel Money, or bank
          transfer — then confirm for yourself that every shilling reached its
          campaign. Nothing taken on faith.
        </m.p>

        <m.div {...enter(0.24)} className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link to={ROUTES.campaigns}>
              Browse campaigns
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href={`#${SECTION_IDS.howItWorks}`}>How verification works</a>
          </Button>
        </m.div>

        <m.p {...enter(0.32)} className="mt-8 text-sm text-muted-foreground">
          Every donation issues a receipt, a payment reference, and a public
          verification record.
        </m.p>
      </div>

      <m.div {...enter(0.2)} className="justify-self-center lg:justify-self-end">
        <HeroReceipt />
      </m.div>
    </section>
  )
}
