"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, RefreshCw } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const SolutionSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 100, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        },
      );

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, x: i === 0 ? -100 : 100, rotateY: i === 0 ? 15 : -15 },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
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
      id="solution"
      className="relative min-h-screen bg-primary py-32 text-white"
    >
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      <div className="container relative mx-auto px-6 md:px-12">
        <h2
          ref={titleRef}
          className="mb-6 text-center text-5xl font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl font-display"
        >
          From <span className="text-white/50">Receipt to Return</span>
        </h2>

<p className="mx-auto mb-24 max-w-3xl text-center text-xl leading-relaxed text-white/80 md:text-2xl">
  Digital receipts are the starting point. Returns management is where the real value comes to life.
</p>


        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <div
            ref={(el: any) => (cardsRef.current[0] = el)}
            className="group relative overflow-hidden rounded-[3rem] bg-white/5 p-10 backdrop-blur-xl transition-all hover:bg-white/10 md:p-16"
            style={{ perspective: "1000px" }}
          >
            <ShieldCheck className="mb-8 h-20 w-20 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
<p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
  SafeReceipts
</p>


        <h3 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl font-display">
              Digital Receipts
            </h3>
            <p className="text-xl leading-relaxed text-white/80 md:text-2xl">
             Capture every purchase with secure, verifiable proof of purchase that is always ready when a return begins.
            </p>





          </div>

          <div
            ref={(el: any) => (cardsRef.current[1] = el)}
            className="group relative overflow-hidden rounded-[3rem] bg-white/5 p-10 backdrop-blur-xl transition-all hover:bg-white/10 md:p-16"
            style={{ perspective: "1000px" }}
          >
            <RefreshCw className="mb-8 h-20 w-20 text-white transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12" />
            <h3 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl font-display">
              ReturnFlow
            </h3>
<h3 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl font-display">
              Returns Management
            </h3>



            <p className="text-xl leading-relaxed text-white/80 md:text-2xl">
              Use verified purchase data to approve, track, and streamline returns with less friction, less fraud, and a better customer experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
