import { ReportsClient } from "@/components/dashboard/reports/reports-client";

export const metadata = {
  title: "Reports",
  description: "Sales, product performance, and monthly PDF reports.",
};

export default function ReportsPage() {
  return <ReportsClient />;
}