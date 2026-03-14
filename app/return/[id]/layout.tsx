import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Status | ReturnFlow by SafeReceipts",
  description: "Track the status of your return request.",
};

export default function ReturnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0A0F1C]">
      {children}
    </div>
  );
}
