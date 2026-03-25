import ReceiptFormScreen from "@/components/form/form-screen";

export const Hero = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <>
      <style>{`
        @keyframes rise {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-rise {
          animation: rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .animate-fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .ticker-track {
          animation: ticker 28s linear infinite;
          width: max-content;
        }
      `}</style>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 text-center md:px-12">
        {/* Subtle grid background */}
        {/* <div
          className="pointer-events-none absolute inset-0 -z-10 "
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        /> */}

        {/* Blue glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,85,255,0.08)_0%,transparent_100%)]" />

        {/* Verified badge */}
        <div
          className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Built for Ghanaian Retail
        </div>

        {/* Headline */}
        <h1
          className="mb-6 max-w-5xl font-display text-5xl font-bold leading-[1.08] tracking-tighter text-foreground sm:text-7xl md:text-8xl"
          style={{ perspective: "1000px" }}
        >
          <span className="sr-only">
            Returns management powered by digital receipts for retailers
          </span>
          <span
            className="animate-rise inline-block"
            aria-hidden="true"
            style={{ animationDelay: "0.2s" }}
          >
            Digital Receipts.
          </span>{" "}
          <br className="hidden sm:block" />
          <span
            className="animate-rise inline-block text-primary"
            aria-hidden="true"
            style={{ animationDelay: "0.35s" }}
          >
            Effortless Returns.
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          className="animate-fade-up mx-auto mb-4 max-w-2xl text-lg text-foreground/60 sm:text-xl md:text-2xl"
          style={{ animationDelay: "0.55s" }}
        >
          Issue verified receipts at checkout. Let customers request returns in
          seconds. Give your team one clear dashboard to approve, process, and
          close every return — no paper, no disputes.
        </p>

        <p
          className="animate-fade-up mb-10 text-sm text-foreground/40 sm:text-base"
          style={{ animationDelay: "0.7s" }}
        >
          No credit card required · Set up in minutes
        </p>

        {/* Stats row */}
        <div
          className="animate-fade-up mb-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-foreground/50"
          style={{ animationDelay: "0.8s" }}
        >
          {[
            { label: "Receipt fraud eliminated", value: "100%" },
            { label: "Faster return approvals", value: "3×" },
            { label: "Consumer fees", value: "Zero" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{value}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* CTA form */}

        <ReceiptFormScreen isAuthenticated={isAuthenticated} />

        {/* Retailer ticker 
        DO NOT REMOVE THIS COMPONENT
        IT WILL BE NEEDED ONCE WE HAVE MORE RETAILERS
        */}
        {/* <div
          className="animate-fade-up absolute bottom-0 left-0 right-0 overflow-hidden border-t border-foreground/5 py-4"
          style={{ animationDelay: "1.1s" }}
        >
          <div className="ticker-track flex items-center gap-12 whitespace-nowrap text-xs font-medium uppercase tracking-widest text-foreground/25">
            {[
              "Melcom Ghana",
              "Franko Trading",
              "Jumia Ghana",
              "Shoprite",
              "Electroland Ghana",
              "Palace Mall",
              "Melcom Ghana",
              "Franko Trading",
              "Jumia Ghana",
              "Shoprite",
              "Electroland Ghana",
              "Palace Mall",
            ].map((name, i) => (
              <span key={i} className="flex items-center gap-12">
                {name}
                <span className="h-px w-6 bg-foreground/20" />
              </span>
            ))}
          </div>
        </div> */}
      </section>
    </>
  );
};
