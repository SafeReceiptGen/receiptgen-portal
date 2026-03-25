import { ShieldCheck, RefreshCw } from "lucide-react";

export const SolutionSection: React.FC = () => {
  return (
    <section
      id="solution"
      className="relative min-h-screen bg-primary py-32 text-white"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      <div className="container relative mx-auto px-6 md:px-12">
        <h2 className="mb-6 text-center font-display text-5xl font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl">
          From <span className="text-white/50">Receipt to Return</span>
        </h2>

        <p className="mx-auto mb-24 max-w-3xl text-center text-xl leading-relaxed text-white/80 md:text-2xl">
          Digital receipts are the starting point. Returns management is where
          the real value comes to life.
        </p>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          {/* SafeReceipts card */}
          <div className="group relative overflow-hidden rounded-[3rem] bg-white/5 p-10 backdrop-blur-xl transition-colors duration-300 hover:bg-white/10 md:p-16">
            <ShieldCheck className="mb-8 h-20 w-20 text-white transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
              SafeReceipts
            </p>
            <h3 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Digital Receipts
            </h3>
            <p className="text-xl leading-relaxed text-white/80 md:text-2xl">
              Capture every purchase with secure, verifiable proof of purchase
              that is always ready when a return begins.
            </p>
          </div>

          {/* ReturnFlow card */}
          <div className="group relative overflow-hidden rounded-[3rem] bg-white/5 p-10 backdrop-blur-xl transition-colors duration-300 hover:bg-white/10 md:p-16">
            <RefreshCw className="mb-8 h-20 w-20 text-white transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/50">
              ReturnFlow
            </p>
            <h3 className="mb-6 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Returns Management
            </h3>
            <p className="text-xl leading-relaxed text-white/80 md:text-2xl">
              Use verified purchase data to approve, track, and streamline
              returns with less friction, less fraud, and a better customer
              experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
