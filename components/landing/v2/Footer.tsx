export const Footer = () => {
  return (
    <footer className="bg-background py-12 border-t border-foreground/10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-2xl font-bold tracking-tighter font-display text-foreground">
            Safe<span className="text-primary">Receipts</span>
          </div>

          <div className="flex gap-8">
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
