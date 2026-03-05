"use client";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import ReceiptFormScreen from "./form/form-screen";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(
    () => {
      gsap.fromTo(
        ".header-item",
        { y: -50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          // delay: 2.5,
        },
      );
    },
    { scope: headerRef },
  );

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 md:w-full w-auto transition-all duration-500 ${
        isScrolled
          ? "bg-background/80 py-4 backdrop-blur-md shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12">
        <div className="header-item text-2xl font-bold tracking-tighter font-display text-foreground">
          Safe<span className="text-primary">Receipts</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {["Problem", "Solution", "How it Works", "Vision"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="header-item text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {item}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          {/* <MagneticButton className="header-item hidden md:inline-flex px-6 py-2 text-sm bg-foreground text-background hover:bg-foreground/90">
            Get Started
          </MagneticButton> */}
          <ReceiptFormScreen />
        </div>
      </div>
    </header>
  );
};
