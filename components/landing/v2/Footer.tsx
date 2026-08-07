import Link from "next/link";
import { Linkedin, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-background py-12 border-t border-foreground/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          
          {/* Logo */}
          <div className="text-2xl font-bold tracking-tighter font-display text-foreground">
            Safe<span className="text-primary">Receipts</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href="#"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Contact
            </a>
            <Link
              href="/careers"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Careers
            </Link>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-4">
            <Link
              href="https://www.linkedin.com/company/safereceipts/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="rounded-full border border-foreground/10 p-2 text-foreground/70 transition hover:border-primary hover:text-primary"
            >
              <Linkedin size={18} />
            </Link>

            <Link
              href="https://x.com/safereceipts"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="rounded-full border border-foreground/10 p-2 text-foreground/70 transition hover:border-primary hover:text-primary"
            >
              <Twitter size={18} />
            </Link>

            <Link
              href="https://www.instagram.com/safereceipts/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-foreground/10 p-2 text-foreground/70 transition hover:border-primary hover:text-primary"
            >
              <Instagram size={18} />
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-foreground/50">
          &copy; {new Date().getFullYear()} SafeReceipts. All rights reserved.
          Built for retailers in Ghana and beyond.
        </div>
      </div>
    </footer>
  );
};