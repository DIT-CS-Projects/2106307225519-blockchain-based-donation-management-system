import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturedCampaignsSection } from '@/components/landing/FeaturedCampaignsSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { StatsSection } from '@/components/landing/StatsSection'
import { WhyVerificationSection } from '@/components/landing/WhyVerificationSection'
import { ClosingCtaSection } from '@/components/landing/ClosingCtaSection'

/**
 * Public landing page — spec: pages/landing-page.md.
 * Testimonials are deliberately absent pre-launch (PRODUCT.md: never
 * fabricate testimonials); the section returns with real donor feedback.
 */
export function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturedCampaignsSection />
      <HowItWorksSection />
      <StatsSection />
      <WhyVerificationSection />
      <ClosingCtaSection />
    </>
  )
}
