"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";

export function AuthSplit({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(
        leftPanelRef.current,
        { x: "-100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 1.2, ease: "power4.out" },
      )
        .fromTo(
          rightPanelRef.current,
          { x: "100%", opacity: 0 },
          { x: "0%", opacity: 1, duration: 1.2, ease: "power4.out" },
          "-=1.2",
        )
        .fromTo(
          ".stagger-item",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
          "-=0.6",
        );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen w-full overflow-hidden bg-background"
    >
      <div
        ref={leftPanelRef}
        className="relative hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex"
      >
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <Link
          href="/"
          className="stagger-item relative z-10 text-3xl font-bold tracking-tighter font-display"
        >
          Safe<span className="text-white/50">Receipts</span>
        </Link>

        <div className="stagger-item relative z-10 max-w-md">
          <h2 className="mb-6 text-5xl font-bold leading-tight tracking-tighter font-display">
            Welcome back to simpler receipts.
          </h2>
          <p className="text-lg text-white/80">
            Issue digital receipts and manage post-purchase requests in one
            place.
          </p>
        </div>

        <div className="stagger-item relative z-10 flex items-center gap-4">
          <div className="flex -space-x-4">
            {[1, 2, 3].map((i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/100?img=${i + 10}`}
                alt="User avatar"
                className="h-12 w-12 rounded-full border-2 border-primary object-cover"
              />
            ))}
          </div>
          <p className="text-sm text-white/80">Join 500+ retailers in Ghana.</p>
        </div>
      </div>

      <div
        ref={rightPanelRef}
        className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-24"
      >
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-12 block text-2xl font-bold tracking-tighter font-display text-foreground lg:hidden"
          >
            Safe<span className="text-primary">Receipts</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
