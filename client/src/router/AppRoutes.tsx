import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { CampaignsPage } from '@/pages/CampaignsPage'
import { CampaignDetailsPage } from '@/pages/CampaignDetailsPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { VerifyPage } from '@/pages/VerifyPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { AccountPage } from '@/pages/AccountPage'
import { DonationsPage } from '@/pages/DonationsPage'
import { DonationDetailPage } from '@/pages/DonationDetailPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminCampaignsPage } from '@/pages/admin/AdminCampaignsPage'
import { AdminCampaignFormPage } from '@/pages/admin/AdminCampaignFormPage'
import { AdminBeneficiariesPage } from '@/pages/admin/AdminBeneficiariesPage'
import { AdminBeneficiaryFormPage } from '@/pages/admin/AdminBeneficiaryFormPage'
import { AdminDisbursementsPage } from '@/pages/admin/AdminDisbursementsPage'
import { AdminDisbursementFormPage } from '@/pages/admin/AdminDisbursementFormPage'
import { AdminDisbursementDetailPage } from '@/pages/admin/AdminDisbursementDetailPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ROUTES } from '@/constants/routes'

/** Central route table. Public, auth, and dashboard routes are added per stage. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.home} element={<LandingPage />} />
        <Route path={ROUTES.campaigns} element={<CampaignsPage />} />
        <Route path={`${ROUTES.campaigns}/:id`} element={<CampaignDetailsPage />} />
        <Route path={ROUTES.about} element={<AboutPage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />
        <Route path={ROUTES.verify} element={<VerifyPage />} />
        <Route path={`${ROUTES.verify}/:receiptNumber`} element={<VerifyPage />} />

        {/* Authentication */}
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />

        {/* Authenticated (any role) */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.account} element={<AccountPage />} />
          <Route path={ROUTES.donations} element={<DonationsPage />} />
          <Route path={`${ROUTES.donations}/:id`} element={<DonationDetailPage />} />
          <Route path="/pay/:reference" element={<CheckoutPage />} />
        </Route>

        <Route path={ROUTES.privacy} element={<PrivacyPage />} />
        <Route path={ROUTES.terms} element={<TermsPage />} />
      </Route>

      {/* Administrator console (RBAC) */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.adminDashboard} element={<AdminDashboardPage />} />
          <Route path={ROUTES.adminCampaigns} element={<AdminCampaignsPage />} />
          <Route path="/admin/campaigns/new" element={<AdminCampaignFormPage />} />
          <Route path="/admin/campaigns/:id/edit" element={<AdminCampaignFormPage />} />
          <Route path={ROUTES.adminBeneficiaries} element={<AdminBeneficiariesPage />} />
          <Route path="/admin/beneficiaries/new" element={<AdminBeneficiaryFormPage />} />
          <Route path="/admin/beneficiaries/:id/edit" element={<AdminBeneficiaryFormPage />} />
          <Route path={ROUTES.adminDisbursements} element={<AdminDisbursementsPage />} />
          <Route path="/admin/disbursements/new" element={<AdminDisbursementFormPage />} />
          <Route path="/admin/disbursements/:id" element={<AdminDisbursementDetailPage />} />
          <Route path={ROUTES.adminUsers} element={<AdminUsersPage />} />
          <Route path={ROUTES.adminReports} element={<AdminReportsPage />} />
          <Route path={ROUTES.adminNotifications} element={<AdminNotificationsPage />} />
          <Route path={ROUTES.adminAudit} element={<AdminAuditPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
