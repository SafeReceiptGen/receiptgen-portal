import { ReceiptsDashboardClient } from "@/components/dashboard/receipts/receipts-dashboard-client";

export const metadata = {
  title: "Receipts",
  description: "View and manage all digital receipts issued across your stores.",
};

export default function ReceiptsPage() {
  return <ReceiptsDashboardClient />;
}
