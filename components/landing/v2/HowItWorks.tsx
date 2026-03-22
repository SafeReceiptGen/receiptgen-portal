"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const steps = [
  {
    num: "01",
    title: "Capture",
    desc: "Issue a SafeReceipts digital receipt at checkout using a QR code or phone number.",
  },
  {
    num: "02",
    title: "Verify",
    desc: "Each purchase is stored securely and ready to verify instantly when a return begins.",
  },
  {
    num: "03",
    title: "Start Return",
    desc: "Customers can initiate a return using their digital receipt without searching for paper records.",
  },
  {
    num: "04",
    title: "Manage",
    desc: "Retailers review, approve, and track returns inside ReturnFlow with verified purchase data.",
  },
  {
    num: "05",
    title: "Resolve",
    desc: "Returns are completed faster with less friction, fewer disputes, and a better customer experience.",
  },
];



export const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scrollWidth = scrollRef.current?.scrollWidth || 0;
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const xOffset = -(scrollWidth - containerWidth);

      gsap.to(scrollRef.current, {
        x: xOffset,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: true, // changed from 1 to true for natural scroll
          end: () => `+=${scrollWidth}`,
        },
      });

      gsap.fromTo(
        ".step-card",
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          // stagger: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative h-screen bg-background overflow-hidden"
    >
      <div
        ref={containerRef}
        className="absolute top-1/2 -translate-y-1/2 w-full px-6 md:px-12"
      >
        <h2 className="mb-16 text-5xl font-bold tracking-tighter md:text-7xl font-display text-foreground">
          How It <span className="text-primary">Works</span>
        </h2>

        <div ref={scrollRef} className="flex gap-8 md:gap-16 w-max">
          {steps.map((step, i) => (
            <div
              key={i}
              className="step-card flex h-[400px] w-[300px] flex-col justify-between rounded-3xl bg-foreground/5 p-8 border border-foreground/10 md:h-[500px] md:w-[400px] md:p-12"
            >
              <div className="text-6xl font-bold text-primary/20 md:text-8xl font-display">
                {step.num}
              </div>
              <div>
                <h3 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl font-display text-foreground">
                  {step.title}
                </h3>
                <p className="text-lg text-foreground/70 md:text-xl">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
