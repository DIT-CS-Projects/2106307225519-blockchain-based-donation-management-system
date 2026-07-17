import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/shared/Reveal'
import { PromiseList } from '@/components/about/PromiseList'
import { APP_NAME } from '@/constants/config'
import { ROUTES } from '@/constants/routes'

const LADDER = [
  {
    step: 'The NGO is verified',
    body: 'Before a campaign appears here, the organisation behind it is checked and approved. Unverified NGOs cannot raise money on the platform.',
  },
  {
    step: 'You give the way you already pay',
    body: 'Donate with M-Pesa, Tigo Pesa, Airtel Money, or bank transfer. The payment feels exactly like the mobile-money flows you use every day.',
  },
  {
    step: 'The donation is recorded for good',
    body: 'The moment your payment is confirmed, it is written to a public ledger and you receive a receipt with its own reference.',
  },
  {
    step: 'You check it yourself',
    body: 'Follow your receipt to the public record and confirm your money reached the campaign. You never have to take our word for it.',
  },
] as const

export function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-12 lg:pt-24">
        <p className="font-medium text-primary">About {APP_NAME}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
          Giving you never have to take on faith
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          {APP_NAME} is a donation platform for Tanzania built on one idea: you should
          be able to prove what happened to your money. Familiar local payments in
          front, an immutable public record behind.
        </p>
      </section>

      <section aria-labelledby="problem-heading" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
          <h2 id="problem-heading" className="font-display text-3xl font-bold text-balance">
            Most giving asks for trust it cannot return
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              People give generously, then hear nothing. Did the money arrive? Reach
              the right people? Get spent as promised? For most donations, there is no
              honest way to find out, so giving quietly becomes an act of faith.
            </p>
            <p>
              {APP_NAME} removes the faith. Not with a promise to be trustworthy, but
              with a record anyone can check. Proof over promises, on every screen.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="ladder-heading" className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
        <div className="max-w-2xl">
          <h2 id="ladder-heading" className="font-display text-3xl font-bold text-balance">
            How a donation works
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Four steps, start to proof. The complexity that makes it permanent stays
            out of your way.
          </p>
        </div>

        <ol className="mt-12 space-y-px overflow-hidden rounded-lg border border-border bg-border">
          {LADDER.map((item, index) => (
            <li key={item.step} className="bg-card">
              <Reveal className="flex gap-5 p-6">
                <span className="font-display text-2xl font-semibold tabular-nums text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-sans text-lg font-semibold">{item.step}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="promise-heading" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
          <div className="max-w-2xl">
            <h2 id="promise-heading" className="font-display text-3xl font-bold text-balance">
              What we hold ourselves to
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              A short list, and we would rather show blanks than break it.
            </p>
          </div>
          <div className="mt-10">
            <PromiseList />
          </div>
        </div>
      </section>

      <section aria-labelledby="tech-heading" className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <h2 id="tech-heading" className="font-display text-3xl font-bold text-balance">
          Where the proof actually lives
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
          <p>
            Your everyday data, campaigns, receipts, and account details, lives in a
            secure database like any serious financial app. Only the proof of a
            donation, an amount and where it went, is anchored to a public blockchain.
          </p>
          <p>
            That anchor is what no one can quietly rewrite. You do not need a wallet, a
            token, or a single word of jargon to use it. The blockchain stays out of
            sight; the verification stays in plain view.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-3xl flex-col items-start px-6 py-16 lg:py-20">
          <h2 className="font-display text-3xl font-bold text-balance">
            See a verified campaign
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Every campaign on {APP_NAME} has cleared the same checks. Browse them and
            follow the proof for yourself.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to={ROUTES.campaigns}>
              Browse campaigns
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
