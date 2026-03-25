"use client";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Enter Receipt Details",
      description: "Fill in store, item, price and payment",
    },
    {
      number: "02",
      title: "Add return terms",
      description: "Choose return window and refund/exchange conditions",
    },
    {
      number: "03",
      title: "Preview receipt",
      description: "See receipt update live",
    },
    {
      number: "04",
      title: "Share with customer",
      description: "Send link or QR/PDF instantly",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-20 lg:py-24 bg-linear-to-b from-white to-slate-50 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Four simple steps to create your professional receipt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative">
          {/* Connecting line for desktop (hidden on mobile and tablet) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 z-0"></div>

          {/* Connecting line for tablet (2x2 grid) */}
          <div className="hidden md:block lg:hidden absolute top-12 left-[25%] right-[25%] h-0.5 bg-slate-200 z-0"></div>
          <div className="hidden md:block lg:hidden absolute top-[calc(50%+3rem)] left-[25%] right-[25%] h-0.5 bg-slate-200 z-0"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center mb-6 group-hover:border-blue-50 group-hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                  <span className="text-2xl font-bold text-slate-500 group-hover:text-white transition-colors duration-300">
                    {index + 1}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 w-full h-full flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
