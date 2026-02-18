import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { EarlyAccessSection } from "@/components/landing/early-access-section";
import { FaqSection } from "@/components/landing/faq-section";
import { SignUpSection } from "@/components/landing/sign-up-section";
import { SiteFooter } from "@/components/landing/site-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <UseCasesSection />
      <EarlyAccessSection />
      <FaqSection />
      <SignUpSection />
      <SiteFooter />
    </div>
  );
}
