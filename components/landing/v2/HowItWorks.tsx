"use client";
import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Create the receipt",
    desc: "Enter the purchase details and generate a digital receipt.",
  },
  {
    num: "02",
    title: "Share with the customer",
    desc: "Customers receive the receipt on their phone after its issued.",
  },
  {
    num: "03",
    title: "Use when needed",
    desc: "The receipt can be retreived whenever proof of purchase is required.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="relative py-24 lg:py-32 bg-background scroll-mt-20 overflow-hidden"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="text-center mb-16 lg:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter font-display text-foreground mb-6">
            How It <span className="text-primary">Works</span>
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical connecting line */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-px bg-primary/20 -translate-x-1/2 hidden sm:block"></div>

          <div className="space-y-12 md:space-y-20">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-12 ${i % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>

                  {/* Content Card */}
                  <div className={`flex flex-1 w-full sm:w-1/2 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-primary/30 p-8 rounded-3xl transition-all duration-300 w-full lg:w-[400px] ${i % 2 === 0 ? 'sm:text-left' : 'sm:text-right'}`}>
                      <div className="text-5xl font-bold text-primary/10 font-display mb-4">
                        {step.num}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-lg text-foreground/70">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-background border-4 border-primary/20 rounded-full items-center justify-center group-hover:border-primary transition-colors duration-300 z-10">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>

                  {/* Empty space for alternating layout on desktop */}
                  <div className="hidden sm:block flex-1 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
