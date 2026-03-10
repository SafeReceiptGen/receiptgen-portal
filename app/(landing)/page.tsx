// import { SiteHeader } from "@/components/landing/site-header";
// import { HeroSection } from "@/components/landing/hero-section";
// import { FeaturesSection } from "@/components/landing/features-section";
// import { HowItWorksSection } from "@/components/landing/how-it-works-section";
// import { UseCasesSection } from "@/components/landing/use-cases-section";
// import { EarlyAccessSection } from "@/components/landing/early-access-section";
// import { FaqSection } from "@/components/landing/faq-section";
// import { SignUpSection } from "@/components/landing/sign-up-section";
// import { SiteFooter } from "@/components/landing/site-footer";
import { Hero } from "@/components/landing/v2/Hero";
import { ProblemSection } from "@/components/landing/v2/ProblemSection";
import { SolutionSection } from "@/components/landing/v2/SolutionSection";
import { HowItWorks } from "@/components/landing/v2/HowItWorks";
import { ValueSection } from "@/components/landing/v2/ValueSection";
import { VisionSection } from "@/components/landing/v2/VisionSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* v2 Components */}
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <ValueSection />
      <VisionSection />

      {/* v1 Components */}
      {/* <SiteHeader /> */}
      {/* <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <UseCasesSection />
      <EarlyAccessSection />
      <FaqSection />
      <SignUpSection />
      <SiteFooter /> */}
    </main>
  );
}
