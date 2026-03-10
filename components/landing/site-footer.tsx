export function SiteFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">
                  API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">
                  Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-600 hover:text-slate-900">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 text-center text-slate-500">
          <p>© {new Date().getFullYear()} SafeReceipts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
