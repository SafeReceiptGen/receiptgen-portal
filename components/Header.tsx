"use client";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
// import ReceiptFormScreen from "./form/form-screen";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(
    () => {
      // Desktop initial load animation
      gsap.fromTo(
        ".header-item",
        { y: -50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        },
      );

      // Mobile Menu Animation Setup
      gsap.set(mobileMenuRef.current, { 
        clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)",
        display: "none"
      });

      tlRef.current = gsap.timeline({ paused: true })
        .set(mobileMenuRef.current, { display: "flex" })
        .to(mobileMenuRef.current, {
          clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)",
          duration: 0.8,
          ease: "power3.inOut"
        })
        .fromTo(
          ".mobile-item",
          { y: 30, opacity: 0, rotationX: -15, transformPerspective: 1000 },
          { 
            y: 0, 
            opacity: 1, 
            rotationX: 0,
            duration: 0.5, 
            stagger: 0.05, 
            ease: "back.out(1.2)" 
          },
          "-=0.4"
        );
    },
    { scope: headerRef }
  );

  useEffect(() => {
    if (isMobileMenuOpen) {
      tlRef.current?.timeScale(1).play();
      document.body.style.overflow = "hidden";
    } else {
      tlRef.current?.timeScale(2.5).reverse();
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navItems = ["Problem", "Solution", "How it Works", "Vision"];

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/80 py-4 backdrop-blur-md shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto flex z-50 items-center justify-between px-6 md:px-12 relative">
        <div className="header-item text-2xl font-bold tracking-tighter font-display z-50 text-foreground relative">
          Safe<span className="text-primary">Receipts</span>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="header-item text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {item}
            </Link>
          ))}
        </nav>
        
        {/* Desktop Auth Links */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="header-item text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Login
          </Link>
          <hr className="h-4 w-px bg-foreground/20" />
          <Link
            href="/signup"
            className="header-item text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Signup
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="header-item md:hidden z-50 relative p-2 text-foreground active:scale-95 transition-transform"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        ref={mobileMenuRef}
        className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl flex-col items-center justify-center hidden pt-20 px-6 overflow-hidden md:hidden"
      >
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
          <nav className="flex flex-col items-center gap-6 text-center">
            {navItems.map((item) => (
              <Link
                key={`mobile-${item}`}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="mobile-item text-4xl font-bold tracking-tight text-foreground transition-all hover:text-primary active:scale-95 duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </Link>
             ))}
          </nav>
          
          <div className="mobile-item w-24 h-px bg-foreground/10 my-4" />
          
          <div className="flex flex-col items-center gap-4 w-full">
            <Link
              href="/login"
              className="mobile-item w-full py-4 text-center rounded-2xl border border-foreground/10 text-lg font-medium transition-all focus:bg-foreground/5 hover:bg-foreground/5 active:scale-95"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="mobile-item w-full py-4 text-center rounded-2xl bg-foreground text-background text-lg font-medium shadow-xl shadow-foreground/10 transition-all hover:shadow-foreground/20 hover:scale-[1.02] active:scale-95"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,40,255,0.05),transparent_60%)] pointer-events-none -z-10" />
      </div>
    </header>
  );
}
