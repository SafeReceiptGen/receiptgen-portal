"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  QrCode,
  Download,
  Clock,
  Shield,
  Zap,
  Users,
  Store,
  Calendar,
  Wallet,
  ChevronDown,
  Menu,
  X,
  Check,
} from "lucide-react";
import ReceiptFormScreen from "@/components/form/form-screen";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const howItWorksRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!howItWorksRef.current) return;

      const section = howItWorksRef.current;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      // Calculate progress through the section (0 to 1)
      const start = sectionTop;
      const end = sectionTop + sectionHeight;
      const progress = Math.max(
        0,
        Math.min(1, (scrollPosition - start) / (end - start)),
      );

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Clock,
      title: "Live Receipt Preview",
      description: "See the receipt update as you type.",
    },
    {
      icon: FileText,
      title: "Return Terms Included",
      description: "Add return windows and refund/exchange conditions.",
    },
    {
      icon: QrCode,
      title: "QR Verification",
      description: "Each receipt has a scannable digital link.",
    },
    {
      icon: Zap,
      title: "Share Instantly",
      description: "Send via WhatsApp or SMS.",
    },
    {
      icon: Shield,
      title: "No Signup Required",
      description: "Generate your first receipt instantly.",
    },
    {
      icon: Store,
      title: "Made For Ghana Ecommerce",
      description:
        "Built for mobile money and local merchants, no POS (point of sale) system required.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Enter Receipt Details",
      description: "Fill in store, item, price and payment",
    },
    {
      number: "02",
      title: "Add return terms",
      description: "Choose return window and refund/exchange conditions",
    },
    {
      number: "03",
      title: "Preview receipt",
      description: "See receipt update live",
    },
    {
      number: "04",
      title: "Share with customer",
      description: "Send link or QE/PDF instantly",
    },
  ];

  const useCases = [
    {
      icon: Users,
      title: "Freelancers & Contractors",
      description:
        "Issue professional receipts to clients for services rendered, with payment tracking and tax documentation.",
    },
    {
      icon: Store,
      title: "Small Businesses",
      description:
        "Generate point-of-sale receipts without expensive POS systems. Perfect for pop-up shops and market vendors.",
    },
    {
      icon: Calendar,
      title: "Event Organizers",
      description:
        "Create receipts for ticket sales, merchandise and vendor payments with centralized tracking.",
    },
    {
      icon: Wallet,
      title: "Personal Finance",
      description:
        "Document personal sales, donations and transactions with verifiable digital receipts.",
    },
  ];

  const faqs = [
    {
      question: "Do I need an account to create a receipt?",
      answer:
        "No. You can generate and share receipts instantly without creating an account.",
    },
    {
      question: "Can I include return terms?",
      answer:
        "Yes. Each receipt shows agreed return windows and refund/exchange conditions.",
    },
    {
      question: " How does my customer receive the receipt?",
      answer:
        "You can share the receipt link via WhatsApp, SMS, or export as a PDF.",
    },
    {
      question: "Are the receipts stored online?",
      answer:
        "Yes. Each receipt gets a secure public link that can be viewed anytime.",
    },
    {
      question: "Is this valid for my business in Ghana?",
      answer:
        "Yes. SafeReceipts is built for Ghanaian merchants and works on mobile phones.",
    },
    {
      question: "What happens if I lose the receipt link?",
      answer:
        "For now, links stay active. Optional accounts for receipt history will be added later.",
    },
    {
      question: "Does my customer need an app?",
      answer: "No. Customers only need a web browser.",
    },
    {
      question: " Is SafeReceipts free to use?",
      answer:
        "Yes. During early access, you can generate unlimited receipts for free.",
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-slate-900" />
              <span className="text-xl font-bold text-slate-900">
                SafeReceipts
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                FAQ
              </button>
              <button className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium">
                Create Receipt
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 relative z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-0 top-1 w-6 h-0.5 bg-slate-900 transition-all duration-300 ${
                    mobileMenuOpen ? "rotate-45 top-2.5" : ""
                  }`}
                ></span>
                <span
                  className={`absolute left-0 top-2.5 w-6 h-0.5 bg-slate-900 transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`absolute left-0 top-4 w-6 h-0.5 bg-slate-900 transition-all duration-300 ${
                    mobileMenuOpen ? "-rotate-45 top-2.5" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Full Screen Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-white z-40 md:hidden transition-all duration-500 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgb(15 23 42 / 0.15) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative h-full flex flex-col">
          {/* Menu Header Spacer */}
          <div className="h-16"></div>

          {/* Menu Content */}
          <div className="flex-1 flex flex-col justify-center px-8 py-12 overflow-y-auto">
            <nav className="space-y-2">
              {[
                { label: "How It Works", id: "how-it-works", delay: "150ms" },
                { label: "FAQ", id: "faq", delay: "300ms" },
              ].map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="w-full text-left group"
                  style={{
                    animation: mobileMenuOpen
                      ? `slideInRight 0.4s ease-out ${item.delay} both`
                      : "none",
                  }}
                >
                  <div className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-slate-50 transition-all duration-300">
                    <span className="text-2xl sm:text-3xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </span>
                    <svg
                      className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <div
              className="mt-12 space-y-4"
              style={{
                animation: mobileMenuOpen
                  ? "slideInRight 0.4s ease-out 350ms both"
                  : "none",
              }}
            >
              <ReceiptFormScreen />
            </div>

            {/* Social Links */}
            <div
              className="mt-auto pt-12"
              style={{
                animation: mobileMenuOpen
                  ? "fadeIn 0.4s ease-out 400ms both"
                  : "none",
              }}
            >
              <div className="flex justify-center space-x-6">
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="./hero.jpg"
                  alt="Professional accounting workspace with laptop and documents"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl -z-10"></div>

                <div className="p-8 sm:p-10">
                  <p className="text-sm sm:text-base text-blue-600 font-medium mb-3 uppercase tracking-wide">
                    Receipt generation for Small Businesses
                  </p>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                    Instant Digital Receipts with Clear Return Terms
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 mb-8">
                    Give customers proof-of-purchase and agreed return windows
                    in under 60 seconds. No signup required.
                  </p>

                  <ReceiptFormScreen />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to make receipt generation effortless
              and professional
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={howItWorksRef}
        id="how-it-works"
        className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Four simple steps to create your professional receipt
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-200 hidden md:block rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 transition-all duration-300 ease-out"
                style={{
                  height: `${scrollProgress * 100}%`,
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50">
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>

            <div className="space-y-16 md:space-y-24">
              {steps.map((step, index) => {
                const stepProgress = Math.max(
                  0,
                  Math.min(1, (scrollProgress - index * 0.25) * 4),
                );
                const isActive = stepProgress > 0 && stepProgress < 1;
                const isCompleted = stepProgress >= 1;

                return (
                  <div
                    key={index}
                    className="relative group"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both`,
                    }}
                  >
                    <div className="flex items-start gap-6 md:gap-8">
                      <div className="relative flex-shrink-0 z-10">
                        <div
                          className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                            isCompleted
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 scale-110 shadow-blue-500/50"
                              : isActive
                                ? "bg-gradient-to-br from-blue-400 to-blue-500 scale-105 shadow-blue-400/40"
                                : "bg-gradient-to-br from-slate-300 to-slate-400"
                          }`}
                        >
                          <span
                            className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${
                              isCompleted || isActive
                                ? "text-white"
                                : "text-slate-100"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </div>
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30"></div>
                        )}
                        {isCompleted && (
                          <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-xl"></div>
                        )}
                      </div>
                      <div
                        className={`flex-1 bg-white rounded-2xl p-6 md:p-8 border transition-all duration-500 ${
                          isCompleted
                            ? "shadow-xl border-blue-200 -translate-y-1"
                            : isActive
                              ? "shadow-lg border-blue-100"
                              : "shadow-md border-slate-100"
                        }`}
                      >
                        <h3
                          className={`text-xl md:text-2xl font-bold mb-3 transition-colors duration-300 ${
                            isCompleted || isActive
                              ? "text-blue-600"
                              : "text-slate-900"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Connecting line for mobile */}
                    {index < steps.length - 1 && (
                      <div className="md:hidden ml-8 h-12 w-0.5 bg-slate-200 my-4 relative overflow-hidden">
                        <div
                          className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-400 to-blue-600 transition-all duration-300"
                          style={{
                            height: `${Math.max(0, Math.min(1, (scrollProgress - (index + 0.25) * 0.25) * 4)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      <section id="use-cases" className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Perfect For Every Need
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Trusted by professionals across various industries
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-slate-50 p-6 sm:p-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-white transition-all"
              >
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-slate-600 mb-4">{useCase.description}</p>
                <button className="text-slate-900 font-medium hover:underline">
                  Learn more →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-white border-y border-blue-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white uppercase tracking-wide">
                    New
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                    Free during early access.
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    We're currently testing SafeReceipts with early merchants.
                    Generate unlimited receipts for free by signing up for an
                    account!
                  </p>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm whitespace-nowrap">
                    Sign Up Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to know about our receipt generator
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-600 flex-shrink-0 transition-transform ${
                      openFaq === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24 bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-10">
              Create Free Account
            </h2>

            {/* Benefits List */}
            <div className="mb-10 space-y-3 text-left max-w-xl mx-auto">
              {[
                "Save your shop details for quick receipt creation",
                "Access past receipts anytime",
                "Add your shop logo",
                "Reissue receipts if needed",
                "Share receipts via WhatsApp",
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-slate-200"
                >
                  <svg
                    className="w-5 h-5 text-blue-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-base sm:text-lg">{benefit}</span>
                </div>
              ))}
            </div>
            <div>
              <button className="px-6 py-2 bg-white text-black rounded-lg hover:bg-slate-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 mb-3">
                Sign Up
              </button>
              <p className="text-slate-400 text-sm">No credit card required</p>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <FileText className="w-6 h-6 text-slate-900" />
              <span className="font-bold text-slate-900">SafeReceipts</span>
            </div>
            <p className="text-slate-600 text-sm">
              © 2026 SafeReceipts. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
