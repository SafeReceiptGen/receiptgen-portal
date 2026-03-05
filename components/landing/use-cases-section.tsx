import { Users, Store, Calendar, Wallet } from "lucide-react";

export function UseCasesSection() {
  const useCases = [
    {
      icon: Users,
      title: "Freelancers & Contractors",
      description:
        "Issue professional receipts to clients for services rendered, with payment tracking and tax documentation.",
    },
    {
      icon: Store,
      title: "Small Businesses",
      description:
        "Generate point-of-sale receipts without expensive POS systems. Perfect for pop-up shops and market vendors.",
    },
    {
      icon: Calendar,
      title: "Event Organizers",
      description:
        "Create receipts for ticket sales, merchandise and vendor payments with centralized tracking.",
    },
    {
      icon: Wallet,
      title: "Personal Finance",
      description:
        "Document personal sales, donations and transactions with verifiable digital receipts.",
    },
  ];

  return (
    <section id="use-cases" className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Perfect For Every Need
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Trusted by professionals across various industries
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-slate-50 p-6 sm:p-8 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-white transition-all"
            >
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                <useCase.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {useCase.title}
              </h3>
              <p className="text-slate-600 mb-4">{useCase.description}</p>
              <button className="text-slate-900 font-medium hover:underline">
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
