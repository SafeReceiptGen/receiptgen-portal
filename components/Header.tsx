"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = ["Problem", "Solution", "How it Works", "Vision"];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .header-item {
          animation: slideDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .header-item:nth-child(1) { animation-delay: 0.05s; }
        .header-item:nth-child(2) { animation-delay: 0.12s; }
        .header-item:nth-child(3) { animation-delay: 0.19s; }
        .header-item:nth-child(4) { animation-delay: 0.26s; }
        .header-item:nth-child(5) { animation-delay: 0.33s; }
        .header-item:nth-child(6) { animation-delay: 0.40s; }
        .header-item:nth-child(7) { animation-delay: 0.47s; }

        /* Mobile menu clip-path reveal from top-right corner */
        .mobile-menu {
          clip-path: circle(0% at calc(100% - 2.5rem) 2.5rem);
          transition: clip-path 0.65s cubic-bezier(0.77, 0, 0.18, 1),
                      visibility 0.65s;
          visibility: hidden;
        }
        .mobile-menu.open {
          clip-path: circle(150% at calc(100% - 2.5rem) 2.5rem);
          visibility: visible;
        }

        /* Staggered nav item reveal inside mobile menu */
        .mobile-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mobile-menu.open .mobile-item:nth-child(1) { transition-delay: 0.25s; opacity: 1; transform: none; }
        .mobile-menu.open .mobile-item:nth-child(2) { transition-delay: 0.31s; opacity: 1; transform: none; }
        .mobile-menu.open .mobile-item:nth-child(3) { transition-delay: 0.37s; opacity: 1; transform: none; }
        .mobile-menu.open .mobile-item:nth-child(4) { transition-delay: 0.43s; opacity: 1; transform: none; }
        .mobile-menu.open .mobile-item:nth-child(5) { transition-delay: 0.49s; opacity: 1; transform: none; }
        .mobile-menu.open .mobile-item:nth-child(6) { transition-delay: 0.55s; opacity: 1; transform: none; }
        .mobile-menu.open .mobile-item:nth-child(7) { transition-delay: 0.61s; opacity: 1; transform: none; }
      `}</style>

      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-background/80 py-4 shadow-sm backdrop-blur-md"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container relative mx-auto flex items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <Link
            href="/"
            className="header-item relative z-50 font-display text-2xl font-bold tracking-tighter text-foreground"
          >
            Safe<span className="text-primary">Receipts</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="header-item text-sm font-medium text-foreground/70 transition-colors duration-200 hover:text-primary"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="header-item text-sm font-medium text-foreground/70 transition-colors duration-200 hover:text-primary"
            >
              Login
            </Link>
            <span className="h-4 w-px bg-foreground/20" />
            <Link
              href="/signup"
              className="header-item rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="header-item relative z-50 p-2 text-foreground transition-transform duration-150 active:scale-90 md:hidden"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu overlay */}
        <div
          className={`mobile-menu fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-background/95 px-6 backdrop-blur-3xl md:hidden ${
            isMobileMenuOpen ? "open" : ""
          }`}
        >
          {/* Decorative glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(0,85,255,0.07),transparent_60%)]" />

          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            {/* Nav links */}
            <nav className="flex flex-col items-center gap-6 text-center">
              {navItems.map((item) => (
                <Link
                  key={`mobile-${item}`}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="mobile-item text-4xl font-bold tracking-tight text-foreground transition-colors duration-200 hover:text-primary active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
            </nav>

            <div className="mobile-item h-px w-24 bg-foreground/10" />

            {/* Auth buttons */}
            <div className="mobile-item flex w-full flex-col gap-3">
              <Link
                href="/login"
                className="mobile-item w-full rounded-2xl border border-foreground/10 py-4 text-center text-lg font-medium transition-colors duration-200 hover:bg-foreground/5 active:scale-95"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="mobile-item w-full rounded-2xl bg-foreground py-4 text-center text-lg font-semibold text-background shadow-xl shadow-foreground/10 transition-all duration-200 hover:scale-[1.02] hover:shadow-foreground/20 active:scale-95"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
