"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "./MagneticButton";
import { ArrowUpRight } from "lucide-react";
import ReceiptFormScreen from "@/components/form/form-screen";

gsap.registerPlugin(ScrollTrigger);

export const VisionSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".vision-text",
        { opacity: 0, y: 100, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="vision"
      className="relative flex min-h-screen flex-col items-center justify-center bg-black py-32 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,85,255,0.2)_0%,transparent_70%)]" />

      <div className="container relative mx-auto px-6 text-center md:px-12">
        <h2 className="vision-text mb-12 text-5xl font-bold leading-tight tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl font-display">
          Make returns simpler <br />
          <span className="text-primary">with digital receipts.</span>
        </h2>

        <p className="vision-text mx-auto mb-16 max-w-4xl text-xl leading-relaxed text-white/70 md:text-3xl">
          When every purchase is backed by a verified digital receipt, returns become faster, fraud is reduced, and retailers gain clearer post-purchase visibility.

        </p>

        {/* <div className="vision-text flex flex-col items-center justify-center gap-6 sm:flex-row"> */}
        {/* <MagneticButton className="group gap-2 px-10 py-6 text-xl">
            Join the Revolution
            <ArrowUpRight
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              size={24}
            />
          </MagneticButton> */}
        <ReceiptFormScreen />
        {/* </div> */}
      </div>
    </section>
  );
};
