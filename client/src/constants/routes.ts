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

/** Primary navigation links shared by Navbar and MobileNav. */
export const NAV_LINKS = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Campaigns', to: ROUTES.campaigns },
  { label: 'About', to: ROUTES.about },
  { label: 'Contact', to: ROUTES.contact },
] as const
