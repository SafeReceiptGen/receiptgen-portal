export function SignUpSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-10">
            Create Free Account
          </h2>

          {/* Benefits List */}
          <div className="mb-10 space-y-3 text-left max-w-xl mx-auto">
            {[
              "Save your shop details for quick receipt creation",
              "Access past receipts anytime",
              "Add your shop logo",
              "Reissue receipts if needed",
              "Share receipts via WhatsApp",
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-slate-200"
              >
                <svg
                  className="w-5 h-5 text-blue-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-base sm:text-lg">{benefit}</span>
              </div>
            ))}
          </div>
          <div>
            <button className="px-6 py-2 bg-white text-black rounded-lg hover:bg-slate-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 mb-3">
              Sign Up
            </button>
            <p className="text-slate-400 text-sm">No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  );
}
