"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileWarning, Smartphone, HelpCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const problems = [
  {
    text: "Paper receipts get lost or fade",
    icon: <FileWarning size={24} className="text-primary" />,
  },
  {
    text: "Customers show screenshots as proof of purchase",
    icon: <Smartphone size={24} className="text-primary" />,
  },
  {
    text: "No/Unclear return policies can cause confusion",
    icon: <HelpCircle size={24} className="text-primary" />,
  },
];

export const NewProblemSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".problem-title",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        },
      );

      gsap.fromTo(
        ".problem-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative z-10 min-h-screen bg-background py-32 flex flex-col justify-center"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="problem-title mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tighter md:text-6xl lg:text-7xl font-display text-foreground">
            The post-purchase experience is <span className="text-primary">still manual.</span>
          </h2>
        </div>

        <div className="mx-auto max-w-3xl">
          <ul className="space-y-6 mb-16">
            {problems.map((item, i) => (
              <li
                key={i}
                className="problem-item flex items-center gap-6 rounded-3xl border border-foreground/10 bg-foreground/5 p-6 md:p-8 transition-colors hover:bg-foreground/10"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  {item.icon}
                </div>
                <span className="text-xl md:text-2xl font-medium text-foreground/80">{item.text}</span>
              </li>
            ))}
          </ul>

          <div className="problem-item text-center">
             <p className="mx-auto max-w-2xl text-xl text-foreground/70 md:text-2xl italic">
              Without reliable proof of purchase, post-purchase interactions become stressful for everyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
