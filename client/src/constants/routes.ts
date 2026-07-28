// Central route table. Never hardcode paths in components.
import {
  BarChart3,
  Bell,
  ClipboardCheck,
  HeartHandshake,
  LayoutDashboard,
  Megaphone,
  Plus,
  ScrollText,
  Send,
  UserCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '@/services/auth'

export const ROUTES = {
  home: '/',
  campaigns: '/campaigns',
  about: '/about',
  contact: '/contact',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  account: '/account',
  donations: '/donations',
  rewards: '/rewards',
  verify: '/verify',
  fundraiser: '/fundraiser',
  fundraiserCampaignNew: '/fundraiser/campaigns/new',
  adminDashboard: '/admin',
  adminReviews: '/admin/reviews',
  adminFundraisers: '/admin/fundraisers',
  adminCampaigns: '/admin/campaigns',
  adminBeneficiaries: '/admin/beneficiaries',
  adminDisbursements: '/admin/disbursements',
  adminUsers: '/admin/users',
  adminAudit: '/admin/audit',
  adminReports: '/admin/reports',
  adminNotifications: '/admin/notifications',
  privacy: '/privacy',
  terms: '/terms',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

/** Detail route for a single campaign. */
export function campaignDetailsPath(id: number | string) {
  return `${ROUTES.campaigns}/${id}`
}

/** Detail route for a single donation. */
export function donationDetailsPath(id: number | string) {
  return `${ROUTES.donations}/${id}`
}

/** Fundraiser: edit one of the signed-in fundraiser's campaigns. */
export function fundraiserCampaignEditPath(id: number | string) {
  return `${ROUTES.fundraiser}/campaigns/${id}/edit`
}

/** Fundraiser: manage one campaign (beneficiaries, payouts, review status). */
export function fundraiserCampaignManagePath(id: number | string) {
  return `${ROUTES.fundraiser}/campaigns/${id}`
}

/**
 * "Start a campaign" destination by role (Decision 024). Fundraisers and admins
 * go to the dashboard. Everyone else, including a signed-in donor, is sent to
 * register a fundraiser account: donors and fundraisers are separate actors, so
 * a donor cannot convert their account.
 */
export function startCampaignPath(role?: string | null): string {
  if (role === 'admin' || role === 'fundraiser') return ROUTES.fundraiser
  return `${ROUTES.register}?type=fundraiser`
}

/** Mock checkout page for a payment reference. */
export function checkoutPath(reference: string) {
  return `/pay/${reference}`
}

/**
 * Where a role lands after signing in, and the safe fallback when a user reaches
 * a route their role cannot open. Always a page the role owns, never the public
 * home, so an authenticated user is never dropped onto the marketing landing.
 */
export function homeForRole(role: UserRole): string {
  if (role === 'admin') return ROUTES.adminDashboard
  if (role === 'fundraiser') return ROUTES.fundraiser
  return ROUTES.campaigns
}

/** Deep link to the public verification page for a specific receipt. */
export function verifyReceiptPath(receiptNumber: string) {
  return `${ROUTES.verify}/${receiptNumber}`
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

/** A link rendered in a console sidebar (icon + label + destination). */
export interface ConsoleNavLink {
  label: string
  to: string
  icon: LucideIcon
  /** Match this route exactly (used for index routes like the dashboard). */
  end?: boolean
}

/** Admin console sidebar links (pages/admin-dashboard.md). */
export const ADMIN_NAV_LINKS: ConsoleNavLink[] = [
  { label: 'Dashboard', to: ROUTES.adminDashboard, icon: LayoutDashboard, end: true },
  { label: 'Reviews', to: ROUTES.adminReviews, icon: ClipboardCheck },
  { label: 'Fundraisers', to: ROUTES.adminFundraisers, icon: UserCheck },
  { label: 'Campaigns', to: ROUTES.adminCampaigns, icon: Megaphone },
  { label: 'Beneficiaries', to: ROUTES.adminBeneficiaries, icon: HeartHandshake },
  { label: 'Disbursements', to: ROUTES.adminDisbursements, icon: Send },
  { label: 'Users', to: ROUTES.adminUsers, icon: Users },
  { label: 'Reports', to: ROUTES.adminReports, icon: BarChart3 },
  { label: 'Notifications', to: ROUTES.adminNotifications, icon: Bell },
  { label: 'Audit Log', to: ROUTES.adminAudit, icon: ScrollText },
]

/** Fundraiser console sidebar links (Decision 020). */
export const FUNDRAISER_NAV_LINKS: ConsoleNavLink[] = [
  { label: 'Your campaigns', to: ROUTES.fundraiser, icon: LayoutDashboard, end: true },
  { label: 'New campaign', to: ROUTES.fundraiserCampaignNew, icon: Plus },
]
