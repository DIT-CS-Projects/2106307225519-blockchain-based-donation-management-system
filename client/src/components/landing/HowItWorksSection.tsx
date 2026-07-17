import { Link } from 'react-router-dom'
import { Reveal } from '@/components/shared/Reveal'
import { ROUTES, SECTION_IDS } from '@/constants/routes'

// A real 4-step sequence — the numbers carry meaning, they are not decoration.
const STEPS = [
  {
    title: 'Browse',
    description: 'Find a verified campaign that matters to you.',
  },
  {
    title: 'Give',
    description: 'Donate with M-Pesa, Tigo Pesa, Airtel Money, or bank transfer.',
  },
  {
    title: 'We confirm',
    description: 'Your payment is confirmed and your receipt issued within moments.',
  },
  {
    title: 'Verify it yourself',
    description: 'A permanent public record lets you confirm your money arrived — anytime.',
  },
] as const

export function HowItWorksSection() {
  return (
    <section
      id={SECTION_IDS.howItWorks}
      aria-labelledby="how-it-works-heading"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 lg:py-24"
    >
      <div className="max-w-2xl">
        <h2 id="how-it-works-heading" className="font-display text-4xl font-bold text-balance">
          How verification works
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Giving takes minutes. Proof lasts forever.
        </p>
      </div>

      <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="h-full">
            <Reveal className="flex h-full flex-col border-t-2 border-primary pt-5">
              <span className="text-sm font-medium tabular-nums text-primary">
                Step {index + 1}
              </span>
              <h3 className="mt-2 font-sans text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>

      <p className="mt-12 text-muted-foreground">
        Want the full picture?{' '}
        <Link to={ROUTES.about} className="font-medium text-primary hover:underline">
          Read how Tuma keeps every record honest
        </Link>
        .
      </p>
    </section>
  )
}
