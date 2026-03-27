import { ShieldCheck, RefreshCw, CheckCircle } from "lucide-react";

export const SolutionSection: React.FC = () => {
  return (
    <section
      id="solution"
      className="relative min-h-screen bg-primary py-32 text-white flex flex-col justify-center"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      <div className="container relative mx-auto px-6 md:px-12">
        <h2 className="mb-6 text-center font-display text-5xl font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl">
          A simple digital receipt retailers can generate in seconds.
        </h2>

        <p className="mx-auto mb-20 max-w-3xl text-center text-xl leading-relaxed text-white/80 md:text-2xl">
          SafeReceipt lets retailers create a digital proof of purchase customers can easily access on their phone.
        </p>

        <div className="mx-auto max-w-4xl">
          <div className="group relative overflow-hidden rounded-[3rem] bg-white/5 p-8 backdrop-blur-xl transition-colors duration-300 hover:bg-white/10 md:p-12 mb-12 border border-white/10">
            <h3 className="mb-8 font-display text-3xl font-bold tracking-tight md:text-4xl text-center">
              Each receipt includes:
            </h3>

            <ul className="space-y-6 max-w-2xl mx-auto">
              {[
                { text: "The retailer’s information", icon: <ShieldCheck className="text-white h-8 w-8" /> },
                { text: "Purchase details", icon: <RefreshCw className="text-white h-8 w-8" /> },
                { text: "A clear return/exchange window", icon: <CheckCircle className="text-white h-8 w-8" /> },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    {item.icon}
                  </div>
                  <span className="text-xl md:text-2xl font-medium text-white/90">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
             <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/80 md:text-2xl">
               It works alongside your existing checkout process and requires no new hardware or POS system.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
