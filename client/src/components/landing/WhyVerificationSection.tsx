import { Reveal } from '@/components/shared/Reveal'

// Verified 2026-07-17: resolves to a daylight panorama of the Dar es Salaam
// harbor (Nichika Sakurai, Unsplash License) — the water Harbor Teal is named for.
const HARBOR_PHOTO = 'https://images.unsplash.com/photo-1674334264912-704cb2a24b37'

const POINTS = [
  {
    title: 'Nothing hidden',
    description:
      'Every donation and every payout is written to a public record that anyone can inspect, without asking permission.',
  },
  {
    title: 'Nothing rewritten',
    description:
      'Once an entry is recorded it cannot be edited or deleted — not by an NGO, not by us.',
  },
  {
    title: 'Nothing taken on faith',
    description:
      "You don't have to trust our word. Follow your receipt to the record and check it yourself.",
  },
  {
    title: 'Everything provable',
    description:
      'Receipts, campaigns, and disbursements each link straight to their permanent proof.',
  },
] as const

export function WhyVerificationSection() {
  return (
    <section aria-labelledby="why-heading" className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <figure>
          <img
            src={`${HARBOR_PHOTO}?auto=format&fit=crop&w=800&q=75`}
            srcSet={`${HARBOR_PHOTO}?auto=format&fit=crop&w=800&q=75 800w, ${HARBOR_PHOTO}?auto=format&fit=crop&w=1400&q=75 1400w`}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="The Dar es Salaam harbor in daylight — teal water beside the city skyline"
            loading="lazy"
            className="aspect-4/3 w-full rounded-lg border border-border object-cover"
          />
          <figcaption className="mt-3 text-sm text-muted-foreground">
            Dar es Salaam — the harbor Tuma's teal is named for. Photo: Nichika
            Sakurai, Unsplash.
          </figcaption>
        </figure>

        <div>
          <h2 id="why-heading" className="font-display text-4xl font-bold text-balance">
            A record no one can quietly change
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Tuma anchors every donation to a tamper-proof public ledger. In plain
            terms, here is what that buys you:
          </p>

          <dl className="mt-8 divide-y divide-border border-y border-border">
            {POINTS.map((point) => (
              <Reveal key={point.title} className="py-5">
                <dt className="font-semibold">{point.title}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
