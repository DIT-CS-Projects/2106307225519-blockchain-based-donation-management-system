import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { APP_NAME, APP_TAGLINE } from '@/constants/config'

const FOOTER_GROUPS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Campaigns', to: ROUTES.campaigns },
      { label: 'About', to: ROUTES.about },
      { label: 'Contact', to: ROUTES.contact },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', to: ROUTES.privacy },
      { label: 'Terms', to: ROUTES.terms },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Get help', to: ROUTES.contact },
      { label: 'Create account', to: ROUTES.register },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs">
          <Link to={ROUTES.home} className="font-display text-xl font-bold text-primary">
            {APP_NAME}
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{APP_TAGLINE}</p>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="font-sans text-sm font-semibold text-foreground">{group.heading}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. Every donation independently verifiable.
        </p>
      </div>
    </footer>
  )
}
