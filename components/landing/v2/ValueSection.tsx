"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Shield,
  Zap,
  TrendingDown,
  Eye,
  Heart,
  Wallet,
  Clock,
  CheckCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const retailerValues = [
  {
    title: "Reduced Fraud",
    desc: "Each receipt is uniquely verified. Prevents reuse or fake paper receipts.",
    icon: <Shield size={24} />,
  },
  {
    title: "Faster Returns",
    desc: "No checking faded paper slips. Clear purchase history. Structured approval flow.",
    icon: <Zap size={24} />,
  },
  {
    title: "Lower Costs",
    desc: "Less staff time spent resolving disputes. Fewer escalations.",
    icon: <TrendingDown size={24} />,
  },
  {
    title: "Better Insights",
    desc: "See return reasons. Track product issues. Identify repeat abuse patterns.",
    icon: <Eye size={24} />,
  },
  {
    title: "Customer Trust",
    desc: "Modern, transparent process. Professional experience.",
    icon: <Heart size={24} />,
  },
];

const customerValues = [
  {
    title: "Never Lose a Receipt",
    desc: "All receipts stored digitally.",
    icon: <Wallet size={24} />,
  },
  {
    title: "Easy Returns",
    desc: "Submit a request from your phone and track status in real time.",
    icon: <CheckCircle size={24} />,
  },
  {
    title: "Faster Refunds",
    desc: "Clear approval flow reduces waiting time.",
    icon: <Clock size={24} />,
  },
  {
    title: "Warranty Tracking",
    desc: "Know exactly when a product warranty expires.",
    icon: <Shield size={24} />,
  },
];

export const ValueSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".value-card",
        { opacity: 0, scale: 0.9, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
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
      id="value"
      className="relative bg-background py-32"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-24 text-center">
          <h2 className="mb-6 text-5xl font-bold tracking-tighter md:text-7xl font-display text-foreground">
            The <span className="text-primary">Value</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/70 md:text-xl">
            Why SafeReceipts matters for everyone.
          </p>
        </div>

        <div className="mb-20">
          <h3 className="mb-12 text-3xl font-bold tracking-tight md:text-5xl font-display text-foreground">
            For Retailers
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {retailerValues.map((val, i) => (
              <div
                key={i}
                className="value-card group rounded-3xl border border-foreground/10 bg-foreground/5 p-8 transition-colors hover:bg-primary hover:text-white"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-primary/10 p-4 text-primary transition-colors group-hover:bg-white/20 group-hover:text-white">
                  {val.icon}
                </div>
                <h4 className="mb-4 text-2xl font-bold font-display text-foreground group-hover:text-white">
                  {val.title}
                </h4>
                <p className="text-foreground/70 group-hover:text-white/90">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-12 text-3xl font-bold tracking-tight md:text-5xl font-display text-foreground">
            For Customers
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {customerValues.map((val, i) => (
              <div
                key={i}
                className="value-card group rounded-3xl border border-foreground/10 bg-foreground/5 p-8 transition-colors hover:bg-primary hover:text-white"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-primary/10 p-4 text-primary transition-colors group-hover:bg-white/20 group-hover:text-white">
                  {val.icon}
                </div>
                <h4 className="mb-4 text-2xl font-bold font-display text-foreground group-hover:text-white">
                  {val.title}
                </h4>
                <p className="text-foreground/70 group-hover:text-white/90">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
