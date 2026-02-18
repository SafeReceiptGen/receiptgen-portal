import ReceiptFormScreen from "@/components/form/form-screen";

export function HeroSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="./hero.jpg"
                alt="Professional accounting workspace with laptop and documents"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl -z-10"></div>

              <div className="p-8 sm:p-10">
                <p className="text-sm sm:text-base text-blue-600 font-medium mb-3 uppercase tracking-wide">
                  Receipt generation for Small Businesses
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  Instant Digital Receipts with Clear Return Terms
                </h1>

                <p className="text-base sm:text-lg text-slate-600 mb-8">
                  Give customers proof-of-purchase and agreed return windows in
                  under 60 seconds. No signup required.
                </p>

                <ReceiptFormScreen />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
