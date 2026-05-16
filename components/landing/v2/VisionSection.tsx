import ReceiptFormScreen from "@/components/form/form-screen";

const pillars = [
  {
    number: "01",
    title: "Issue",
    description:
      "Send a verified digital receipt at checkout via QR code or phone number. No paper. No fading ink.",
  },
  {
    number: "02",
    title: "Store",
    description:
      "Every receipt lives securely in the customer's digital wallet — always findable, always valid.",
  },
  {
    number: "03",
    title: "Request",
    description:
      'Customers tap "Request Return" directly from their receipt. Structured, traceable, instant.',
  },
  {
    number: "04",
    title: "Approve",
    description:
      "Your team reviews every return/exchange in one clean dashboard. Full purchase history. One click to approve.",
  },
];

export const VisionSection = ({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) => {
  return (
    <>
      <style>{`
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandWidth {
          from { width: 0; }
          to   { width: 100%; }
        }
        .reveal-up {
          animation: revealUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .pillar-line {
          animation: expandWidth 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>

      <section
        id="vision"
        className="relative overflow-hidden bg-foreground py-32 text-background"
      >
        {/* Subtle noise texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

        {/* Blue accent glow */}
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

        <div className="container relative mx-auto px-6 md:px-12">
          {/* Section label */}
          <p
            className="reveal-up mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-background/40"
            style={{ animationDelay: "0.1s" }}
          >
            The Vision
          </p>

          {/* Headline */}
          <h2
            className="reveal-up mb-8 max-w-4xl font-display text-5xl font-bold leading-[1.06] tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ animationDelay: "0.2s" }}
          >
            When every purchase{" "}
            <span className="text-primary">is verified</span>,<br />
            returns become{" "}
            <span className="italic text-background/60">simple</span>.
          </h2>

          {/* Body */}
          <p
            className="reveal-up mb-16 max-w-2xl text-lg leading-relaxed text-background/50 md:text-xl"
            style={{ animationDelay: "0.35s" }}
          >
            
Returns/exchanges without friction. No fraud. No disputes. No wasted time at the returns desk. 
Just seamless returns and staff focused on creating value for customers. 
This is the future of retail in Ghana.

 </p>

          {/* How it works — 4-step pillars */}
          <div
            className="reveal-up mb-20 grid gap-px border border-background/10 sm:grid-cols-2 lg:grid-cols-4"
            style={{ animationDelay: "0.5s" }}
          >
            {pillars.map(({ number, title, description }) => (
              <div
                key={number}
                className="group relative flex flex-col gap-4 bg-background/[0.03] p-8 transition-colors duration-300 hover:bg-background/[0.07]"
              >
                <span className="font-mono text-xs text-background/30">
                  {number}
                </span>
                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                {/* Animated underline on hover */}
                <div className="h-px w-8 bg-primary transition-all duration-500 group-hover:w-full" />
                <p className="text-sm leading-relaxed text-background/50">
                  {description}
                </p>
              </div>
            ))}
          </div>


          {/* CTA */}
          <ReceiptFormScreen isAuthenticated={isAuthenticated} />
        </div>
      </section>
    </>
  );
};
