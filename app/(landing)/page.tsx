// import { SiteHeader } from "@/components/landing/site-header";
// import { HeroSection } from "@/components/landing/hero-section";
// import { FeaturesSection } from "@/components/landing/features-section";
// import { HowItWorksSection } from "@/components/landing/how-it-works-section";
// import { UseCasesSection } from "@/components/landing/use-cases-section";
// import { EarlyAccessSection } from "@/components/landing/early-access-section";
// import { FaqSection } from "@/components/landing/faq-section";
// import { SignUpSection } from "@/components/landing/sign-up-section";
// import { SiteFooter } from "@/components/landing/site-footer";

import { Footer } from "@/components/landing/v2/Footer";
import { Hero } from "@/components/landing/v2/Hero";
import { ProblemSection } from "@/components/landing/v2/ProblemSection";
import { SolutionSection } from "@/components/landing/v2/SolutionSection";
import { HowItWorks } from "@/components/landing/v2/HowItWorks";
import { ValueSection } from "@/components/landing/v2/ValueSection";
import { VisionSection } from "@/components/landing/v2/VisionSection";
import Script from "next/script";

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SafeReceipts",
    operatingSystem: "Web browser",
    applicationCategory: "BusinessApplication",
    description:
      "Returns management powered by digital receipts for faster verification, smoother workflows, and better post-purchase experiences. ",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <main className="min-h-screen">
      <Script
        id="schema-org-safereceipts"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* v2 Components */}
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <ValueSection />
      <VisionSection />
      {/* <Footer /> */}
    </main>
  );
}
