import { Loader2 } from "lucide-react";

export default function ReturnWizardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8 dark:bg-[#111827]">
      <div className="flex flex-col items-center">
        <Loader2 size={40} className="animate-spin text-primary dark:text-blue-400" />
        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-white/60">
          Loading Return Flow...
        </p>
      </div>
    </div>
  );
}
