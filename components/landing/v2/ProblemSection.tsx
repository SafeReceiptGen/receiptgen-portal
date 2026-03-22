"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Store,
  UserX,
  FileWarning,
  Clock,
  SearchX,
  ShieldAlert,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const problems = [
  {
    title: "For Retailers",
    icon: <Store className="mb-4 h-12 w-12 text-primary" />,
    items: [
      {
        text: "Lost receipts slow down return verification and create disputes at the returns desk.",
        icon: <FileWarning size={20} />,
      },
      {
        text: "Fake or reused receipts increase fraud and unnecessary refund losses.",
        icon: <ShieldAlert size={20} />,
      },
      {
        text: "Manual return approvals waste staff time and delay the customer experience.",
        icon: <Clock size={20} />,
      },
      {
        text: "Limited visibility makes it hard to understand return patterns and product issues.",
        icon: <SearchX size={20} />,
      },
    ],
  },
  {
    title: "For Customers",
    icon: <UserX className="mb-4 h-12 w-12 text-primary" />,
    items: [
      {
        text: "Paper receipts fade, get lost, or are unavailable when a return is needed..",
        icon: <FileWarning size={20} />,
      },
      {
        text: "Returns feel inconsistent and stressful when purchase verification takes too long.",
        icon: <SearchX size={20} />,
      },
      { text: "Refunds are slow, unclear, and difficult to track.", icon: <Clock size={20} /> },
      {
        text: "There is no simple way to keep purchase records ready for warranties or future returns.",
        icon: <ShieldAlert size={20} />,
      },
    ],
  },
];

export const ProblemSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 100, rotateX: -15 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          },
        );

        gsap.fromTo(
          card.querySelectorAll(".problem-item"),
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 75%",
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative z-10 min-h-screen bg-background py-32"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="problem-title mb-20 text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tighter md:text-6xl lg:text-7xl font-display text-foreground">
            Returns Shouldn&apos;t Be <span className="text-primary">This Hard</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/70 md:text-xl">
            Lost receipts, slow approvals, and manual workflows make returns frustrating for customers and expensive for retailers.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-16">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              ref={(el: any) => (cardsRef.current[idx] = el)}
              className="group relative overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5 p-8 transition-colors hover:bg-foreground/10 md:p-12"
              style={{ perspective: "1000px" }}
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />

              {problem.icon}
              <h3 className="mb-8 text-3xl font-bold tracking-tight font-display text-foreground">
                {problem.title}
              </h3>

              <ul className="space-y-6">
                {problem.items.map((item, i) => (
                  <li
                    key={i}
                    className="problem-item flex items-start gap-4 text-foreground/80"
                  >
                    <span className="mt-1 flex-shrink-0 text-primary">
                      {item.icon}
                    </span>
                    <span className="text-lg leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
