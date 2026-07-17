import { Clock, ShieldCheck } from 'lucide-react'
import { ContactForm } from '@/components/contact/ContactForm'
import { APP_NAME } from '@/constants/config'

const POINTS = [
  {
    icon: Clock,
    title: 'We reply to real people',
    body: 'Questions about a campaign, a donation, or how verification works reach a person, not a queue.',
  },
  {
    icon: ShieldCheck,
    title: 'Nothing to prove up front',
    body: 'You do not need an account to get in touch. Accounts and in-app support arrive in a later release.',
  },
] as const

export function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="lg:pt-4">
          <p className="font-medium text-primary">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">
            Talk to {APP_NAME}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Something unclear, a campaign to flag, or a question before you give? Send
            it over and we will get back to you.
          </p>

          <dl className="mt-10 space-y-8">
            {POINTS.map((point) => (
              <div key={point.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <point.icon className="size-5 text-secondary-foreground" aria-hidden="true" />
                </span>
                <div>
                  <dt className="font-semibold">{point.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {point.body}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <ContactForm />
      </div>
    </section>
  )
}
