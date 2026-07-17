// Central route table — never hardcode paths in components.

export const ROUTES = {
  home: '/',
  campaigns: '/campaigns',
  about: '/about',
  contact: '/contact',
  login: '/login',
  register: '/register',
  privacy: '/privacy',
  terms: '/terms',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

/** Detail route for a single campaign. */
export function campaignDetailsPath(id: number | string) {
  return `${ROUTES.campaigns}/${id}`
}

/** In-page anchor ids used by cross-section links. */
export const SECTION_IDS = {
  howItWorks: 'how-it-works',
} as const

/** Primary navigation links shared by Navbar and MobileNav. */
export const NAV_LINKS = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Campaigns', to: ROUTES.campaigns },
  { label: 'About', to: ROUTES.about },
  { label: 'Contact', to: ROUTES.contact },
] as const
