"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MagneticButton } from "./MagneticButton";
import { ArrowRight } from "lucide-react";
import ReceiptFormScreen from "@/components/form/form-screen";

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 0 });

      tl.fromTo(
        textRef.current?.children || [],
        { y: 100, opacity: 0, rotateX: -90 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: "power4.out",
          transformOrigin: "50% 100%",
        },
      )
        .fromTo(
          subRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
          "-=0.8",
        )
        .fromTo(
          btnRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
          "-=0.6",
        );

      // Parallax effect on scroll
      gsap.to(containerRef.current, {
        y: 150,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center md:px-12">
      <div ref={containerRef}>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,85,255,0.1)_0%,transparent_50%)]" />

        <div className="max-w-5xl">
          <h1
            ref={textRef}
            className="mb-6 text-5xl font-bold leading-[1.1] tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl font-display text-foreground"
            style={{ perspective: "1000px" }}
          >
            <span className="inline-block">Post-Purchase</span>{" "}
            <span className="inline-block text-primary">Made Simple.</span>
          </h1>

          <p
            ref={subRef}
            className="mx-auto mb-10 max-w-2xl text-lg text-foreground/70 sm:text-xl md:text-2xl"
          >
            SafeReceipts + ReturnFlow replaces paper receipts with secure,
            verifiable digital proof of purchase and simple returns management.
          </p>

          <div
            // ref={btnRef}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            {/* <MagneticButton className="group gap-2 px-8 py-4 text-lg">
            Start Free Trial
            <ArrowRight
            className="transition-transform group-hover:translate-x-1"
            size={20}
            />
            </MagneticButton>
            <MagneticButton className="bg-transparent text-foreground border border-foreground/20 hover:bg-foreground/5 px-8 py-4 text-lg">
            Book a Demo
            </MagneticButton> */}
          </div>
        </div>
      </div>
      <ReceiptFormScreen />
    </section>
  );
};
