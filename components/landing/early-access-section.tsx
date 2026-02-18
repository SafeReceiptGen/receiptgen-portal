export function EarlyAccessSection() {
  return (
    <section className="py-8 sm:py-12 bg-white border-y border-blue-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white uppercase tracking-wide">
                  New
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Free during early access.
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  We're currently testing SafeReceipts with early merchants.
                  Generate unlimited receipts for free by signing up for an
                  account!
                </p>
              </div>
              <div className="shrink-0 w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm whitespace-nowrap">
                  Sign Up Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
