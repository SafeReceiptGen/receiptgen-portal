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
    desc: "Verified digital receipts make it harder to reuse fake or duplicate proof of purchase during returns.",
    icon: <Shield size={24} />,
  },
  {
    title: "Faster Returns",
    desc: "Instant purchase verification speeds up approvals and reduces delays at the returns desk.",
    icon: <Zap size={24} />,
  },
  {
    title: "Lower Costs",
    desc: "Less staff time is spent resolving disputes, checking receipts, and handling manual return workflows.",
    icon: <TrendingDown size={24} />,
  },
  {
    title: "Better Insights",
    desc: "Track return reasons, spot product issues, and identify patterns that impact operations.",
    icon: <Eye size={24} />,
  },
  {
    title: "Customer Trust",
    desc: "A smoother, more transparent return experience builds confidence and improves loyalty.",
    icon: <Heart size={24} />,
  },







];

const customerValues = [
  {
    title: "Digital Receipts Ready",
    desc: "Purchases are stored digitally, so receipts are always available when proof of purchase is needed.",
    icon: <Wallet size={24} />,
  },
  {
    title: "Easy Returns/Exchange",
    desc: "Start a return/exchange from your phone and stay updated without searching for paper receipts.",
    icon: <CheckCircle size={24} />,
  },
  {
    title: "Faster Refunds",
    desc: "Verified purchase data helps retailers approve returns more quickly and clearly.",
    icon: <Clock size={24} />,
  },
  {
    title: "Warranty Tracking",
    desc: "Keep proof of purchase accessible for warranties, support, and future returns.",
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
            Why It <span className="text-primary">Matters</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/70 md:text-xl">
            SafeReceipts and ReturnFlow help retailers streamline returns while giving customers a faster, more reliable post-purchase experience.
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
