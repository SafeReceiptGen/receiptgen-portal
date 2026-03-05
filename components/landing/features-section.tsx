import { Clock, FileText, QrCode, Zap, Shield, Store } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Clock,
      title: "Live Receipt Preview",
      description: "See the receipt update as you type.",
    },
    {
      icon: FileText,
      title: "Return Terms Included",
      description: "Add return windows and refund/exchange conditions.",
    },
    {
      icon: QrCode,
      title: "QR Verification",
      description: "Each receipt has a scannable digital link.",
    },
    {
      icon: Zap,
      title: "Share Instantly",
      description: "Send via WhatsApp or SMS.",
    },
    {
      icon: Shield,
      title: "No Signup Required",
      description: "Generate your first receipt instantly.",
    },
    {
      icon: Store,
      title: "Made For Ghana Ecommerce",
      description:
        "Built for mobile money and local merchants, no POS (point of sale) system required.",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to make receipt generation effortless and
            professional
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
