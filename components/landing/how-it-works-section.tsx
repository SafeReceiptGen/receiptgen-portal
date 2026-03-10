"use client";

import { useRef, useState, useEffect } from "react";

export function HowItWorksSection() {
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

  return (
    <section
      ref={howItWorksRef}
      id="how-it-works"
      className="py-16 sm:py-20 lg:py-24 bg-linear-to-b from-white to-slate-50 overflow-hidden"
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
              className="absolute top-0 left-0 w-full bg-linear-to-b from-blue-400 via-blue-500 to-blue-600 transition-all duration-300 ease-out"
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
                    <div className="relative shrink-0 z-10">
                      <div
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                          isCompleted
                            ? "bg-linear-to-br from-blue-500 to-blue-600 scale-110 shadow-blue-500/50"
                            : isActive
                              ? "bg-linear-to-br from-blue-400 to-blue-500 scale-105 shadow-blue-400/40"
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
                        className="absolute top-0 left-0 w-full bg-linear-to-b from-blue-400 to-blue-600 transition-all duration-300"
                        style={{
                          height: `${
                            Math.max(
                              0,
                              Math.min(
                                1,
                                (scrollProgress - (index + 0.25) * 0.25) * 4,
                              ),
                            ) * 100
                          }%`,
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
    </section>
  );
}
